import { execFile } from "node:child_process";
import {
  chmod,
  lstat,
  mkdtemp,
  open,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  basename,
  delimiter,
  extname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";
import { promisify } from "node:util";

import {
  BeatAPIClient,
  BeatAPIError,
  type CreateEffectTaskInput,
  type EcommerceVideoTaskInput,
  type ImageGenerationTaskInput,
  type MusicVideoShotEditInput,
  type MusicVideoTaskInput,
  type TextResponseInput,
  type VideoAnalysisTaskInput,
  type VideoGenerationTaskInput,
  type UpdateWebhookInput,
} from "../vendor/client/index.js";

const execFileAsync = promisify(execFile);
const MAX_STANDARD_UPLOAD_BYTES = 50 * 1024 * 1024;
const MAX_VIDEO_UPLOAD_BYTES = 100 * 1024 * 1024;
const MIME_TYPES: Readonly<Record<string, string>> = {
  ".aac": "audio/aac",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".m4a": "audio/mp4",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".mov": "video/quicktime",
  ".mp4": "video/mp4",
  ".srt": "application/x-subrip",
  ".wav": "audio/wav",
  ".webp": "image/webp",
};
const FORBIDDEN_CREDENTIAL_KEYS = new Set([
  "apikey",
  "authorization",
  "bearer",
  "clientsecret",
  "secret",
  "signingsecret",
  "webhooksecret",
  "accesstoken",
  "refreshtoken",
]);
const CREDENTIAL_VALUE_PATTERNS = [
  /\bsk_[A-Za-z0-9_-]{6,}\b/i,
  /\bwhsec_[A-Za-z0-9_-]{6,}\b/i,
  /\bBearer\s+[A-Za-z0-9._~-]{6,}\b/i,
];

type Input = Record<string, unknown>;

function assertNoCredentialMaterial(value: unknown, path = "input"): void {
  if (typeof value === "string") {
    if (CREDENTIAL_VALUE_PATTERNS.some((pattern) => pattern.test(value))) {
      throw new Error(
        `Credentials must be configured in the host, never passed through ${path}.`,
      );
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((child, index) =>
      assertNoCredentialMaterial(child, `${path}[${index}]`),
    );
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const normalized = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
    if (FORBIDDEN_CREDENTIAL_KEYS.has(normalized)) {
      throw new Error(`Credential field ${path}.${key} is not accepted.`);
    }
    assertNoCredentialMaterial(child, `${path}.${key}`);
  }
}

function stringValue(input: Input, key: string): string {
  const value = input[key];
  if (typeof value !== "string" || !value) throw new TypeError(`${key} is required.`);
  return value;
}

function without<T extends Input>(input: T, keys: string[]): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([key]) => !keys.includes(key)),
  );
}

function nestedObject(input: Input, key: string): Record<string, unknown> {
  const value = input[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${key} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function generationBody(input: Input): Record<string, unknown> {
  return {
    ...nestedObject(input, "parameters"),
    model: stringValue(input, "model"),
  };
}

function directApiKeyRequired(capability: string): never {
  throw new Error(
    `${capability} requires BEATAPI_API_KEY in the plugin Configure screen or host environment. Do not paste the key into chat.`,
  );
}

function redactText(value: string): string {
  return value
    .replace(/\bsk_[A-Za-z0-9_-]{6,}\b/g, "[REDACTED_API_KEY]")
    .replace(/\bwhsec_[A-Za-z0-9_-]{6,}\b/g, "[REDACTED_WEBHOOK_SECRET]")
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, "Bearer [REDACTED]");
}

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize);
  if (typeof value === "string") return redactText(value);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(
        ([key]) =>
          !/^(secret|client[_-]?secret|api[_-]?key|authorization)$/i.test(key),
      )
      .map(([key, child]) => [key, sanitize(child)]),
  );
}

function parseCliJson(stdout: string): unknown {
  const text = stdout.trim();
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] !== "{" && text[index] !== "[") continue;
    try {
      return JSON.parse(text.slice(index));
    } catch {
      // Keep scanning because auth status prints a sentence before JSON.
    }
  }
  throw new Error("BeatAPI CLI did not return JSON.");
}

function cliCommand(args: string[]): { file: string; args: string[] } {
  const configured = process.env.BEATAPI_CLI_PATH?.trim();
  if (!configured) {
    throw new Error(
      "BEATAPI_CLI_PATH must point to the absolute path of the reviewed BeatAPI CLI.",
    );
  }
  if (!isAbsolute(configured)) {
    throw new Error("BEATAPI_CLI_PATH must be an absolute trusted path.");
  }
  if (/\.(?:mjs|cjs|js)$/i.test(configured)) {
    return { file: process.execPath, args: [configured, ...args] };
  }
  return { file: configured, args };
}

function cliEnvironment(): NodeJS.ProcessEnv {
  const allowed = [
    "PATH",
    "Path",
    "HOME",
    "USERPROFILE",
    "APPDATA",
    "LOCALAPPDATA",
    "XDG_CONFIG_HOME",
    "XDG_DATA_HOME",
    "TMPDIR",
    "TMP",
    "TEMP",
    "SystemRoot",
    "ComSpec",
    "PATHEXT",
    "BEATAPI_BASE_URL",
    "BEATAPI_TRUST_CUSTOM_BASE_URL",
  ];
  return Object.fromEntries(
    allowed.flatMap((key) => {
      const value = process.env[key];
      return value === undefined ? [] : [[key, value]];
    }),
  );
}

async function runCli(args: string[], timeout = 15 * 60 * 1000): Promise<unknown> {
  const command = cliCommand(args);
  const result = await execFileAsync(command.file, command.args, {
    env: cliEnvironment(),
    encoding: "utf8",
    timeout,
    maxBuffer: 8 * 1024 * 1024,
  });
  return parseCliJson(result.stdout);
}

interface CliExecutionError extends Error {
  code?: number | string;
  stdout?: string;
  stderr?: string;
}

function cliErrorText(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const cliError = error as CliExecutionError;
  return [cliError.stderr, cliError.stdout, cliError.message]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.trim())
    .join("\n");
}

function isMissingCli(error: unknown): boolean {
  return (
    error instanceof Error &&
    ((error as CliExecutionError).code === "ENOENT" ||
      /BEATAPI_CLI_PATH must point/.test(error.message))
  );
}

function isMissingCliAuthentication(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const cliError = error as CliExecutionError;
  return (
    cliError.code === 1 &&
    /not authenticated|beatapi auth login/i.test(cliErrorText(error))
  );
}

async function withJsonFile<T>(
  value: unknown,
  callback: (path: string) => Promise<T>,
): Promise<T> {
  const directory = await mkdtemp(resolve(tmpdir(), "beatapi-plugin-"));
  await chmod(directory, 0o700);
  const path = resolve(directory, "input.json");
  try {
    await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, {
      mode: 0o600,
      flag: "wx",
    });
    return await callback(path);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

interface PreparedUpload {
  bytes: Buffer;
  filename: string;
  mimeType: string;
}

async function prepareUpload(requestedPath: string): Promise<PreparedUpload> {
  const configuredRoots = (process.env.BEATAPI_UPLOAD_ROOTS ?? "")
    .split(delimiter)
    .map((value) => value.trim())
    .filter(Boolean);
  if (configuredRoots.length === 0) {
    throw new Error(
      "File upload is disabled until BEATAPI_UPLOAD_ROOTS is configured with one or more trusted absolute directories.",
    );
  }
  if (configuredRoots.some((root) => !isAbsolute(root))) {
    throw new Error("Every BEATAPI_UPLOAD_ROOTS entry must be an absolute path.");
  }

  const requested = resolve(requestedPath);
  const requestedInfo = await lstat(requested);
  if (requestedInfo.isSymbolicLink()) {
    throw new Error("Symbolic links are not accepted for BeatAPI uploads.");
  }
  const canonicalPath = await realpath(requested);
  const canonicalRoots = await Promise.all(configuredRoots.map((root) => realpath(root)));
  const approved = canonicalRoots.some((root) => {
    const child = relative(root, canonicalPath);
    return child === "" || (child !== ".." && !child.startsWith(`..${sep}`) && !isAbsolute(child));
  });
  if (!approved) {
    throw new Error(
      "The selected file is outside every approved upload root in BEATAPI_UPLOAD_ROOTS.",
    );
  }

  const mimeType = MIME_TYPES[extname(canonicalPath).toLowerCase()];
  if (!mimeType) {
    throw new Error(
      `Unsupported file extension: ${extname(canonicalPath) || "(none)"}.`,
    );
  }
  const maxUploadBytes = mimeType.startsWith("video/")
    ? MAX_VIDEO_UPLOAD_BYTES
    : MAX_STANDARD_UPLOAD_BYTES;
  const file = await open(canonicalPath, "r");
  try {
    const info = await file.stat();
    if (!info.isFile()) throw new Error(`${canonicalPath} is not a file.`);
    if (info.size > maxUploadBytes) {
      throw new Error(
        `BeatAPI ${mimeType.startsWith("video/") ? "video " : ""}uploads are limited to ${maxUploadBytes / 1024 / 1024} MB.`,
      );
    }
    return {
      bytes: await file.readFile(),
      filename: basename(canonicalPath),
      mimeType,
    };
  } finally {
    await file.close();
  }
}

async function withPreparedUploadFile<T>(
  upload: PreparedUpload,
  callback: (path: string) => Promise<T>,
): Promise<T> {
  const directory = await mkdtemp(resolve(tmpdir(), "beatapi-upload-"));
  await chmod(directory, 0o700);
  const path = resolve(directory, upload.filename);
  try {
    await writeFile(path, upload.bytes, { mode: 0o600, flag: "wx" });
    return await callback(path);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

export class BeatAPIExecutor {
  private readonly apiKey = process.env.BEATAPI_API_KEY?.trim();
  private readonly direct = new BeatAPIClient({
    apiKey: this.apiKey,
    baseUrl: process.env.BEATAPI_BASE_URL,
    allowInsecureLocalhost:
      process.env.BEATAPI_ALLOW_INSECURE_LOCALHOST === "1",
    trustCustomBaseUrl:
      process.env.BEATAPI_TRUST_CUSTOM_BASE_URL === "1",
  });

  private get usesDirectClient(): boolean {
    return Boolean(this.apiKey);
  }

  async execute(name: string, input: Input): Promise<unknown> {
    assertNoCredentialMaterial(input);
    if (name === "beatapi_check_setup") return this.checkSetup();
    if (name === "beatapi_list_workflows") {
      return sanitize(await this.direct.listWorkflows());
    }
    if (name === "beatapi_list_text_models") {
      if (!this.usesDirectClient) directApiKeyRequired("Text model discovery");
      return sanitize(await this.direct.listTextModels());
    }
    if (name === "beatapi_list_generation_models") {
      return sanitize(await this.direct.listGenerationModels());
    }
    if (name === "beatapi_list_effects") {
      return sanitize(await this.direct.listEffects({
        ...(typeof input.output_type === "string"
          ? { outputType: input.output_type as "image" | "video" }
          : {}),
        ...(typeof input.category === "string" ? { category: input.category } : {}),
      }));
    }
    if (name === "beatapi_get_effect") {
      return sanitize(await this.direct.getEffect(stringValue(input, "effect_id")));
    }
    if (
      !this.usesDirectClient &&
      (name === "beatapi_create_text_response" ||
        name === "beatapi_analyze_video")
    ) {
      directApiKeyRequired("This BeatAPI capability");
    }
    if (!this.usesDirectClient) return this.executeViaCli(name, input);
    return this.executeDirect(name, input);
  }

  private async checkSetup(): Promise<unknown> {
    if (this.usesDirectClient) {
      return {
        configured: true,
        auth_source: "environment",
        usage: sanitize(await this.direct.getUsage()),
      };
    }
    try {
      return {
        configured: true,
        auth_source: "beatapi-cli-keychain",
        usage: sanitize(await runCli(["auth", "status"])),
      };
    } catch (error) {
      if (isMissingCli(error)) {
        return {
          configured: false,
          auth_source: null,
          setup_reason: "cli_path_required",
          next_step:
            "Use the plugin Configure action to store BEATAPI_API_KEY, or install the reviewed CLI with `npm install --global beatapi@0.2.0`, set BEATAPI_CLI_PATH to its absolute executable path, and run `beatapi auth login` in a terminal. Do not paste the API key into chat.",
        };
      }
      if (isMissingCliAuthentication(error)) {
        return {
          configured: false,
          auth_source: null,
          setup_reason: "authentication_required",
          next_step:
            "Use the plugin Configure action to store BEATAPI_API_KEY, or run `beatapi auth login` in a terminal, then check setup again. Do not paste the API key into chat.",
        };
      }
      const detail = cliErrorText(error);
      throw new Error(
        `Unable to verify BeatAPI CLI setup${detail ? `: ${detail}` : "."}`,
        { cause: error },
      );
    }
  }

  private async executeDirect(name: string, input: Input): Promise<unknown> {
    switch (name) {
      case "beatapi_get_usage":
        return sanitize(await this.direct.getUsage());
      case "beatapi_create_text_response":
        return sanitize(
          await this.direct.createTextResponse({
            ...nestedObject(input, "request"),
            model: stringValue(input, "model"),
            stream: false,
          } as TextResponseInput),
        );
      case "beatapi_create_image":
        return sanitize(
          await this.direct.createImageTask(
            generationBody(input) as ImageGenerationTaskInput,
          ),
        );
      case "beatapi_create_video":
        return sanitize(
          await this.direct.createVideoTask(
            generationBody(input) as VideoGenerationTaskInput,
          ),
        );
      case "beatapi_create_effect":
        return sanitize(
          await this.direct.createEffectTask(
            without(input, ["idempotency_key"]) as CreateEffectTaskInput,
            { idempotencyKey: stringValue(input, "idempotency_key") },
          ),
        );
      case "beatapi_analyze_video":
        return sanitize(
          await this.direct.createVideoAnalysisTask(
            without(input, ["idempotency_key"]) as VideoAnalysisTaskInput,
            {
              ...(typeof input.idempotency_key === "string"
                ? { idempotencyKey: input.idempotency_key }
                : {}),
            },
          ),
        );
      case "beatapi_upload_file": {
        const upload = await prepareUpload(stringValue(input, "path"));
        return sanitize(
          await this.direct.uploadFile(upload.bytes, {
            filename: upload.filename,
            mimeType: upload.mimeType,
            purpose: "input",
          }),
        );
      }
      case "beatapi_create_music_video":
        return sanitize(
          await this.direct.createMusicVideoTask(input as MusicVideoTaskInput),
        );
      case "beatapi_edit_music_video_shot": {
        const taskId = stringValue(input, "task_id");
        const shotId = stringValue(input, "shot_id");
        return sanitize(
          await this.direct.editMusicVideoShot(
            taskId,
            shotId,
            without(input, ["task_id", "shot_id"]) as MusicVideoShotEditInput,
          ),
        );
      }
      case "beatapi_get_music_video_shot_media":
        return sanitize(
          await this.direct.getMusicVideoShotMedia(
            stringValue(input, "task_id"),
            stringValue(input, "shot_id"),
          ),
        );
      case "beatapi_compose_music_video":
        return sanitize(
          await this.direct.composeMusicVideoTask(stringValue(input, "task_id"), {
            shot_ids: input.shot_ids as string[],
          }),
        );
      case "beatapi_create_ecommerce_video":
        return sanitize(
          await this.direct.createEcommerceVideoTask(
            input as EcommerceVideoTaskInput,
          ),
        );
      case "beatapi_get_realtime_session":
        return sanitize(
          await this.direct.getRealtimeSession(
            stringValue(input, "session_id"),
          ),
        );
      case "beatapi_close_realtime_session":
        return sanitize(
          await this.direct.closeRealtimeSession(
            stringValue(input, "session_id"),
          ),
        );
      case "beatapi_get_task":
        return sanitize(await this.direct.getTask(stringValue(input, "task_id")));
      case "beatapi_wait_for_task":
        return sanitize(
          await this.direct.waitForTask(stringValue(input, "task_id"), {
            intervalMs: input.interval_ms as number,
            maxAttempts: input.max_attempts as number,
          }),
        );
      case "beatapi_list_webhooks":
        return sanitize(await this.direct.listWebhooks());
      case "beatapi_get_webhook":
        return sanitize(
          await this.direct.getWebhook(stringValue(input, "webhook_id")),
        );
      case "beatapi_update_webhook": {
        const webhookId = stringValue(input, "webhook_id");
        return sanitize(
          await this.direct.updateWebhook(
            webhookId,
            without(input, ["webhook_id"]) as UpdateWebhookInput,
          ),
        );
      }
      case "beatapi_delete_webhook":
        return sanitize(
          await this.direct.deleteWebhook(stringValue(input, "webhook_id")),
        );
      default:
        throw new Error(`Unsupported BeatAPI tool: ${name}`);
    }
  }

  private async executeViaCli(name: string, input: Input): Promise<unknown> {
    let result: unknown;
    switch (name) {
      case "beatapi_get_usage":
        result = await runCli(["usage"]);
        break;
      case "beatapi_create_image":
        result = await withJsonFile(generationBody(input), (path) =>
          runCli(["images", "create", "--file", path]),
        );
        break;
      case "beatapi_create_video":
        result = await withJsonFile(generationBody(input), (path) =>
          runCli(["videos", "create", "--file", path]),
        );
        break;
      case "beatapi_create_effect":
        result = await withJsonFile(without(input, ["idempotency_key"]), (path) =>
          runCli([
            "effects",
            "create",
            "--file",
            path,
            "--idempotency-key",
            stringValue(input, "idempotency_key"),
          ]),
        );
        break;
      case "beatapi_upload_file": {
        const upload = await prepareUpload(stringValue(input, "path"));
        result = await withPreparedUploadFile(upload, (path) =>
          runCli(["files", "upload", path]),
        );
        break;
      }
      case "beatapi_create_music_video":
        result = await withJsonFile(input, (path) =>
          runCli(["music-video", "create", "--file", path]),
        );
        break;
      case "beatapi_edit_music_video_shot":
        result = await withJsonFile(without(input, ["task_id", "shot_id"]), (path) =>
          runCli([
            "music-video",
            "shots",
            "edit",
            stringValue(input, "task_id"),
            stringValue(input, "shot_id"),
            "--file",
            path,
          ]),
        );
        break;
      case "beatapi_get_music_video_shot_media":
        result = await runCli([
          "music-video",
          "shots",
          "media",
          stringValue(input, "task_id"),
          stringValue(input, "shot_id"),
        ]);
        break;
      case "beatapi_compose_music_video":
        result = await runCli([
          "music-video",
          "compose",
          stringValue(input, "task_id"),
          ...(input.shot_ids as string[]).flatMap((shot) => ["--shot", shot]),
        ]);
        break;
      case "beatapi_create_ecommerce_video":
        result = await withJsonFile(input, (path) =>
          runCli(["ecommerce-video", "create", "--file", path]),
        );
        break;
      case "beatapi_get_realtime_session":
        result = await runCli([
          "realtime",
          "sessions",
          "get",
          stringValue(input, "session_id"),
        ]);
        break;
      case "beatapi_close_realtime_session":
        result = await runCli([
          "realtime",
          "sessions",
          "close",
          stringValue(input, "session_id"),
        ]);
        break;
      case "beatapi_get_task":
        result = await runCli(["tasks", "get", stringValue(input, "task_id")]);
        break;
      case "beatapi_wait_for_task":
        result = await runCli(
          [
            "tasks",
            "wait",
            stringValue(input, "task_id"),
            "--interval",
            String(input.interval_ms),
            "--attempts",
            String(input.max_attempts),
          ],
          (input.interval_ms as number) * (input.max_attempts as number) + 60_000,
        );
        break;
      case "beatapi_list_webhooks":
        result = await runCli(["webhooks", "list"]);
        break;
      case "beatapi_get_webhook":
        result = await runCli(["webhooks", "get", stringValue(input, "webhook_id")]);
        break;
      case "beatapi_update_webhook":
        result = await withJsonFile(without(input, ["webhook_id"]), (path) =>
          runCli([
            "webhooks",
            "update",
            stringValue(input, "webhook_id"),
            "--file",
            path,
          ]),
        );
        break;
      case "beatapi_delete_webhook":
        result = await runCli(["webhooks", "delete", stringValue(input, "webhook_id")]);
        break;
      default:
        throw new Error(`Unsupported BeatAPI tool: ${name}`);
    }
    return sanitize(result);
  }
}

export function safeError(error: unknown): Record<string, unknown> {
  if (error instanceof BeatAPIError) {
    return {
      error: redactText(error.message),
      code: error.code,
      status: error.status,
      request_id: error.requestId,
      retry_after_seconds: error.retryAfterSeconds,
    };
  }
  const message = error instanceof Error ? error.message : String(error);
  return { error: redactText(message) };
}
