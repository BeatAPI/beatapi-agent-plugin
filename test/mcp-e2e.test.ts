import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, rm, symlink, truncate, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const root = resolve(import.meta.dirname, "..");

test("bundled stdio MCP serves BeatAPI tools and protects credentials", async () => {
  const requests: Array<{
    method: string;
    path: string;
    authorization?: string;
    body?: string;
  }> = [];
  const httpServer = createServer(async (request, response) => {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    requests.push({
      method: request.method ?? "GET",
      path: request.url ?? "/",
      body: Buffer.concat(chunks).toString("utf8"),
      ...(request.headers.authorization
        ? { authorization: request.headers.authorization }
        : {}),
    });

    response.setHeader("content-type", "application/json");
    if (request.url === "/v1/workflows") {
      response.end(
        JSON.stringify({
          data: {
            object: "list",
            data: [{ id: "music-video", object: "workflow" }],
          },
        }),
      );
      return;
    }
    if (request.url === "/v1/models") {
      response.end(
        JSON.stringify({
          object: "list",
          data: [
            {
              id: "gpt-5.6-sol",
              object: "model",
              created: 1,
              owned_by: "beatapi",
            },
          ],
        }),
      );
      return;
    }
    if (request.url === "/v1/responses") {
      response.end(
        JSON.stringify({
          id: "resp_test",
          object: "response",
          model: "gpt-5.6-sol",
          output_text: "Launch summary",
        }),
      );
      return;
    }
    if (request.url === "/v1/media/models") {
      response.end(
        JSON.stringify({
          data: {
            object: "list",
            data: [
              {
                id: "nano-banana",
                object: "generation_model",
                name: "Nano Banana",
                media_type: "image",
                input_modes: ["text"],
              },
            ],
          },
        }),
      );
      return;
    }
    if (request.url === "/v1/effects") {
      response.end(
        JSON.stringify({
          data: {
            object: "list",
            data: [{ id: "video-muscle-max", object: "effect" }],
          },
        }),
      );
      return;
    }
    if (request.url === "/v1/effects/video-muscle-max") {
      response.end(
        JSON.stringify({
          data: { id: "video-muscle-max", object: "effect", version: 1 },
        }),
      );
      return;
    }
    if (request.url === "/v1/usage") {
      response.end(
        JSON.stringify({
          data: {
            object: "usage",
            credit_balance: 1000,
            total_tasks: 0,
            credits_settled: 0,
            credits_refunded: 0,
            concurrency: {
              limit: 5,
              active: 0,
            },
            by_workflow: [],
          },
        }),
      );
      return;
    }
    if (request.url === "/v1/music-video/tasks") {
      response.statusCode = 201;
      response.end(
        JSON.stringify({
          data: {
            id: "task_test",
            object: "task",
            workflow: "music-video",
            status: "queued",
            stage: "queued",
            storyboard: { shots: [] },
            created_at: 1,
            updated_at: 1,
            completed_at: null,
            output: null,
            usage: {
              credits_reserved: 50,
              credits_charged: 50,
              billable_duration_seconds: 10,
              credits_settled: 0,
              credits_refunded: 0,
            },
            request_id: "req_test",
            error_code: null,
            error_message: null,
          },
        }),
      );
      return;
    }
    if (request.url === "/v1/video-analysis/tasks") {
      response.statusCode = 201;
      response.end(
        JSON.stringify({
          data: {
            id: "task_video_analysis",
            object: "task",
            task_kind: "workflow",
            capability_id: "video-analysis",
            capability_version: 1,
            status: "queued",
          },
        }),
      );
      return;
    }
    if (
      request.url === "/v1/images/tasks" ||
      request.url === "/v1/videos/tasks" ||
      request.url === "/v1/effects/tasks"
    ) {
      response.statusCode = 201;
      response.end(
        JSON.stringify({
          data: {
            id: `task_${request.url.split("/")[2]}`,
            object: "task",
            task_kind: request.url.includes("images")
              ? "image"
              : request.url.includes("videos")
                ? "video"
                : "effect",
            status: "queued",
          },
        }),
      );
      return;
    }
    if (request.url === "/v1/realtime/sessions" && request.method === "POST") {
      response.statusCode = 201;
      response.end(
        JSON.stringify({
          data: {
            id: "brt_test",
            object: "realtime.session",
            status: "ready",
            client_secret: "brt_secret_must_never_reach_the_model",
            expires_at: "2026-07-31T12:01:00Z",
            max_duration_seconds: 60,
            allowed_origins: ["https://app.example.com"],
            credits: { reserved: 60, settled: 0, refunded: 0 },
            request_id: "req_realtime",
            created_at: "2026-07-31T12:00:00Z",
            connected_at: null,
            closed_at: null,
          },
        }),
      );
      return;
    }
    if (request.url === "/v1/realtime/sessions/brt_test") {
      response.end(
        JSON.stringify({
          data: {
            id: "brt_test",
            object: "realtime.session",
            status: request.method === "DELETE" ? "closed" : "active",
            expires_at: "2026-07-31T12:01:00Z",
            max_duration_seconds: 60,
            allowed_origins: ["https://app.example.com"],
            credits: { reserved: 60, settled: 12, refunded: 48 },
            request_id: "req_realtime",
            created_at: "2026-07-31T12:00:00Z",
            connected_at: "2026-07-31T12:00:05Z",
            closed_at:
              request.method === "DELETE" ? "2026-07-31T12:00:17Z" : null,
          },
        }),
      );
      return;
    }
    if (request.url === "/v1/webhooks") {
      response.statusCode = 201;
      response.end(
        JSON.stringify({
          data: {
            id: "wh_test",
            object: "webhook_endpoint",
            url: "https://example.com/webhooks/beatapi",
            events: ["task.succeeded", "task.failed"],
            status: "active",
            secret: "whsec_this_value_must_never_reach_the_model",
            created_at: 1,
            updated_at: 1,
          },
        }),
      );
      return;
    }
    response.statusCode = 404;
    response.end(
      JSON.stringify({
        error: { code: "not_found", message: "Not found", request_id: "req_404" },
      }),
    );
  });

  await new Promise<void>((resolveListening) =>
    httpServer.listen(0, "127.0.0.1", resolveListening),
  );
  const address = httpServer.address();
  assert.ok(address && typeof address === "object");
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve(root, "mcp/server.mjs")],
    cwd: root,
    env: {
      ...process.env,
      BEATAPI_API_KEY: "test_plugin_api_key",
      BEATAPI_BASE_URL: `http://127.0.0.1:${address.port}`,
      BEATAPI_ALLOW_INSECURE_LOCALHOST: "1",
    } as Record<string, string>,
    stderr: "pipe",
  });
  const client = new Client({ name: "beatapi-plugin-test", version: "0.1.0" });

  try {
    await client.connect(transport);
    const listed = await client.listTools();
    assert.equal(listed.tools.length, 26);
    assert.ok(listed.tools.every((tool) => !/api[_-]?key/i.test(JSON.stringify(tool.inputSchema))));

    const workflows = await client.callTool({
      name: "beatapi_list_workflows",
      arguments: {},
    });
    assert.equal(
      (workflows.structuredContent as { result: Array<{ id: string }> }).result[0]?.id,
      "music-video",
    );

    const textModels = await client.callTool({
      name: "beatapi_list_text_models",
      arguments: {},
    });
    assert.equal(
      (textModels.structuredContent as { result: Array<{ id: string }> }).result[0]?.id,
      "gpt-5.6-sol",
    );

    const textResponse = await client.callTool({
      name: "beatapi_create_text_response",
      arguments: {
        model: "gpt-5.6-sol",
        request: { input: "Summarize this launch note" },
      },
    });
    assert.equal(
      (textResponse.structuredContent as { result: { id: string } }).result.id,
      "resp_test",
    );
    assert.equal(
      JSON.parse(
        requests.find((request) => request.path === "/v1/responses")?.body ?? "{}",
      ).stream,
      false,
    );

    const models = await client.callTool({
      name: "beatapi_list_generation_models",
      arguments: {},
    });
    assert.equal(
      (models.structuredContent as { result: Array<{ id: string }> }).result[0]?.id,
      "nano-banana",
    );

    const imageTask = await client.callTool({
      name: "beatapi_create_image",
      arguments: {
        model: "future-image-model",
        parameters: { prompt: "Editorial still", aspect_ratio: "16:9" },
      },
    });
    assert.equal(
      (imageTask.structuredContent as { result: { id: string } }).result.id,
      "task_images",
    );
    assert.deepEqual(
      JSON.parse(
        requests.find((request) => request.path === "/v1/images/tasks")?.body ?? "{}",
      ),
      {
        model: "future-image-model",
        prompt: "Editorial still",
        aspect_ratio: "16:9",
      },
    );
    const imageRequestCount = requests.filter(
      (request) => request.path === "/v1/images/tasks",
    ).length;
    const credentialInput = await client.callTool({
      name: "beatapi_create_image",
      arguments: {
        model: "future-image-model",
        parameters: { metadata: { api_key: "sk_must_not_leave_the_host" } },
      },
    });
    assert.equal(credentialInput.isError, true);
    assert.doesNotMatch(JSON.stringify(credentialInput), /sk_must_not_leave/);
    assert.equal(
      requests.filter((request) => request.path === "/v1/images/tasks").length,
      imageRequestCount,
    );

    const effects = await client.callTool({
      name: "beatapi_list_effects",
      arguments: {},
    });
    assert.equal(
      (effects.structuredContent as { result: Array<{ id: string }> }).result[0]?.id,
      "video-muscle-max",
    );

    const effect = await client.callTool({
      name: "beatapi_get_effect",
      arguments: { effect_id: "video-muscle-max" },
    });
    assert.equal(
      (effect.structuredContent as { result: { version: number } }).result.version,
      1,
    );

    const effectTask = await client.callTool({
      name: "beatapi_create_effect",
      arguments: {
        effect_id: "video-muscle-max",
        images: ["https://media.example.com/portrait.png"],
        idempotency_key: "effect-mcp-test",
      },
    });
    assert.equal(
      (effectTask.structuredContent as { result: { id: string } }).result.id,
      "task_effects",
    );

    const analysisTask = await client.callTool({
      name: "beatapi_analyze_video",
      arguments: {
        video_url: "https://media.example.com/product-demo.mp4",
        prompt: "Identify the key scenes",
        analysis_depth: "deep",
        max_output_tokens: 2048,
        idempotency_key: "analysis-mcp-test",
      },
    });
    assert.equal(
      (analysisTask.structuredContent as { result: { id: string } }).result.id,
      "task_video_analysis",
    );

    const musicTask = await client.callTool({
      name: "beatapi_create_music_video",
      arguments: {
        images: ["https://media.example.com/image.png"],
        audio_url: "https://media.example.com/audio.mp3",
        duration: 10,
        quality: "standard",
        resolution: "720p",
      },
    });
    assert.equal(
      (musicTask.structuredContent as { result: { id: string } }).result.id,
      "task_test",
    );

    const currentRealtimeSession = await client.callTool({
      name: "beatapi_get_realtime_session",
      arguments: { session_id: "brt_test" },
    });
    assert.equal(
      (
        currentRealtimeSession.structuredContent as {
          result: { status: string };
        }
      ).result.status,
      "active",
    );

    const closedRealtimeSession = await client.callTool({
      name: "beatapi_close_realtime_session",
      arguments: { session_id: "brt_test" },
    });
    assert.equal(
      (
        closedRealtimeSession.structuredContent as {
          result: { status: string };
        }
      ).result.status,
      "closed",
    );

    const authenticatedRequests = requests.filter(
      (request) =>
        request.path !== "/v1/workflows" &&
        request.path !== "/v1/media/models" &&
        !(
          request.method === "GET" &&
          request.path.startsWith("/v1/effects")
        ),
    );
    assert.ok(
      authenticatedRequests.every(
        (request) => request.authorization === "Bearer test_plugin_api_key",
      ),
    );
    assert.equal(
      requests.find((request) => request.path === "/v1/workflows")?.authorization,
      undefined,
    );
    assert.equal(
      requests.find((request) => request.path === "/v1/media/models")?.authorization,
      undefined,
    );
    assert.ok(
      requests
        .filter(
          (request) =>
            request.method === "GET" && request.path.startsWith("/v1/effects"),
        )
        .every((request) => request.authorization === undefined),
    );
  } finally {
    await client.close().catch(() => undefined);
    await transport.close().catch(() => undefined);
    await new Promise<void>((resolveClosed, reject) =>
      httpServer.close((error) => (error ? reject(error) : resolveClosed())),
    );
  }
});

test("bundled MCP reuses the API key saved by the BeatAPI CLI", async () => {
  const directory = await mkdtemp(resolve(tmpdir(), "beatapi-cli-bridge-test-"));
  const fakeCli = resolve(directory, "fake-beatapi.mjs");
  await writeFile(
    fakeCli,
    [
      "const args = process.argv.slice(2);",
      "if (args.join(' ') === 'auth status') {",
      "  process.stdout.write('Authenticated via credential-store.\\n');",
      "  process.stdout.write(JSON.stringify({ object: 'usage', credit_balance: 321, total_tasks: 0, credits_settled: 0, credits_refunded: 0, concurrency: { limit: 1, active: 0 }, by_workflow: [], saw_unrelated_secret: Boolean(process.env.TEST_UNRELATED_SECRET) }));",
      "} else if (args.join(' ') === 'usage') {",
      "  process.stdout.write(JSON.stringify({ object: 'usage', credit_balance: 321, total_tasks: 0, credits_settled: 0, credits_refunded: 0, concurrency: { limit: 1, active: 0 }, by_workflow: [], saw_unrelated_secret: Boolean(process.env.TEST_UNRELATED_SECRET) }));",
      "} else {",
      "  process.stderr.write(`unexpected fake CLI args: ${args.join(' ')}\\n`);",
      "  process.exitCode = 2;",
      "}",
      "",
    ].join("\n"),
    { mode: 0o700 },
  );
  const environment = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key, value]) => key !== "BEATAPI_API_KEY" && value !== undefined,
    ),
  ) as Record<string, string>;
  environment.BEATAPI_CLI_PATH = fakeCli;
  environment.CODEX_HOME = directory;
  environment.TEST_UNRELATED_SECRET = "must_not_reach_the_cli";

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve(root, "mcp/server.mjs")],
    cwd: root,
    env: environment,
    stderr: "pipe",
  });
  const client = new Client({ name: "beatapi-cli-bridge-test", version: "0.1.0" });
  try {
    await client.connect(transport);
    const setup = await client.callTool({
      name: "beatapi_check_setup",
      arguments: {},
    });
    const setupResult = (
      setup.structuredContent as {
        result: {
          configured: boolean;
          auth_source: string;
          usage: { credit_balance: number; saw_unrelated_secret: boolean };
        };
      }
    ).result;
    assert.equal(setupResult.configured, true);
    assert.equal(setupResult.auth_source, "beatapi-cli-keychain");
    assert.equal(setupResult.usage.credit_balance, 321);
    assert.equal(setupResult.usage.saw_unrelated_secret, false);

    const usage = await client.callTool({
      name: "beatapi_get_usage",
      arguments: {},
    });
    assert.equal(
      (usage.structuredContent as { result: { credit_balance: number } }).result
        .credit_balance,
      321,
    );
  } finally {
    await client.close().catch(() => undefined);
    await transport.close().catch(() => undefined);
    await rm(directory, { recursive: true, force: true });
  }
});

test("video upload preflight follows the public 100 MB contract limit", async () => {
  const directory = await mkdtemp(resolve(tmpdir(), "beatapi-video-limit-test-"));
  const videoPath = resolve(directory, "too-large.mp4");
  await writeFile(videoPath, "");
  await truncate(videoPath, 100 * 1024 * 1024 + 1);

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve(root, "mcp/server.mjs")],
    cwd: root,
    env: {
      ...process.env,
      BEATAPI_API_KEY: "test_plugin_api_key",
      BEATAPI_BASE_URL: "http://127.0.0.1:9",
      BEATAPI_ALLOW_INSECURE_LOCALHOST: "1",
      BEATAPI_UPLOAD_ROOTS: directory,
    } as Record<string, string>,
    stderr: "pipe",
  });
  const client = new Client({ name: "beatapi-video-limit-test", version: "0.1.0" });

  try {
    await client.connect(transport);
    const result = await client.callTool({
      name: "beatapi_upload_file",
      arguments: { path: videoPath },
    });
    assert.equal(result.isError, true);
    assert.match(JSON.stringify(result), /100 MB/);
  } finally {
    await client.close().catch(() => undefined);
    await transport.close().catch(() => undefined);
    await rm(directory, { recursive: true, force: true });
  }
});

test("upload rejects paths outside configured roots and symlink escapes", async () => {
  const approved = await mkdtemp(resolve(tmpdir(), "beatapi-approved-root-"));
  const outside = await mkdtemp(resolve(tmpdir(), "beatapi-outside-root-"));
  const outsideFile = resolve(outside, "private.png");
  const linkedFile = resolve(approved, "linked.png");
  await writeFile(outsideFile, "private");
  await symlink(outsideFile, linkedFile);

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve(root, "mcp/server.mjs")],
    cwd: root,
    env: {
      ...process.env,
      BEATAPI_API_KEY: "test_plugin_api_key",
      BEATAPI_BASE_URL: "http://127.0.0.1:9",
      BEATAPI_ALLOW_INSECURE_LOCALHOST: "1",
      BEATAPI_UPLOAD_ROOTS: approved,
    } as Record<string, string>,
    stderr: "pipe",
  });
  const client = new Client({ name: "beatapi-upload-root-test", version: "0.1.0" });

  try {
    await client.connect(transport);
    for (const path of [outsideFile, linkedFile]) {
      const result = await client.callTool({
        name: "beatapi_upload_file",
        arguments: { path },
      });
      assert.equal(result.isError, true);
      assert.match(JSON.stringify(result), /approved upload root|symbolic link/i);
    }
  } finally {
    await client.close().catch(() => undefined);
    await transport.close().catch(() => undefined);
    await rm(approved, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});

test("setup reports a missing CLI login as an actionable configuration state", async () => {
  const directory = await mkdtemp(resolve(tmpdir(), "beatapi-cli-auth-test-"));
  const fakeCli = resolve(directory, "fake-beatapi.mjs");
  await writeFile(
    fakeCli,
    [
      "if (process.argv.slice(2).join(' ') === 'auth status') {",
      "  process.stdout.write('Not authenticated. Run `beatapi auth login`.\\n');",
      "  process.exitCode = 1;",
      "} else {",
      "  process.exitCode = 2;",
      "}",
      "",
    ].join("\n"),
    { mode: 0o700 },
  );
  const environment = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key, value]) => key !== "BEATAPI_API_KEY" && value !== undefined,
    ),
  ) as Record<string, string>;
  environment.BEATAPI_CLI_PATH = fakeCli;

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve(root, "mcp/server.mjs")],
    cwd: root,
    env: environment,
    stderr: "pipe",
  });
  const client = new Client({ name: "beatapi-cli-auth-test", version: "0.1.0" });
  try {
    await client.connect(transport);
    const setup = await client.callTool({
      name: "beatapi_check_setup",
      arguments: {},
    });
    const result = (
      setup.structuredContent as {
        result: {
          configured: boolean;
          setup_reason: string;
          next_step: string;
        };
      }
    ).result;
    assert.equal(setup.isError, undefined);
    assert.equal(result.configured, false);
    assert.equal(result.setup_reason, "authentication_required");
    assert.match(result.next_step, /beatapi auth login/);
    assert.match(result.next_step, /Configure.*BEATAPI_API_KEY/i);
  } finally {
    await client.close().catch(() => undefined);
    await transport.close().catch(() => undefined);
    await rm(directory, { recursive: true, force: true });
  }
});

test("setup requires an absolute reviewed CLI path for keychain mode", async () => {
  const environment = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key, value]) =>
        key !== "BEATAPI_API_KEY" && key !== "BEATAPI_CLI_PATH" && value !== undefined,
    ),
  ) as Record<string, string>;
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve(root, "mcp/server.mjs")],
    cwd: root,
    env: environment,
    stderr: "pipe",
  });
  const client = new Client({ name: "beatapi-cli-path-test", version: "0.1.0" });

  try {
    await client.connect(transport);
    const setup = await client.callTool({
      name: "beatapi_check_setup",
      arguments: {},
    });
    const result = (
      setup.structuredContent as {
        result: { configured: boolean; setup_reason: string; next_step: string };
      }
    ).result;
    assert.equal(result.configured, false);
    assert.equal(result.setup_reason, "cli_path_required");
    assert.match(result.next_step, /BEATAPI_CLI_PATH.*absolute/i);
  } finally {
    await client.close().catch(() => undefined);
    await transport.close().catch(() => undefined);
  }
});

test("setup preserves unexpected CLI runtime failures as tool errors", async () => {
  const directory = await mkdtemp(resolve(tmpdir(), "beatapi-cli-failure-test-"));
  const fakeCli = resolve(directory, "fake-beatapi.mjs");
  await writeFile(
    fakeCli,
    [
      "process.stderr.write('temporary credential-store service failure\\n');",
      "process.exitCode = 7;",
      "",
    ].join("\n"),
    { mode: 0o700 },
  );
  const environment = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key, value]) => key !== "BEATAPI_API_KEY" && value !== undefined,
    ),
  ) as Record<string, string>;
  environment.BEATAPI_CLI_PATH = fakeCli;

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve(root, "mcp/server.mjs")],
    cwd: root,
    env: environment,
    stderr: "pipe",
  });
  const client = new Client({
    name: "beatapi-cli-failure-test",
    version: "0.1.0",
  });
  try {
    await client.connect(transport);
    const setup = await client.callTool({
      name: "beatapi_check_setup",
      arguments: {},
    });
    assert.equal(setup.isError, true);
    assert.match(JSON.stringify(setup), /credential-store service failure/);
    assert.doesNotMatch(JSON.stringify(setup), /"configured":false/);
  } finally {
    await client.close().catch(() => undefined);
    await transport.close().catch(() => undefined);
    await rm(directory, { recursive: true, force: true });
  }
});
