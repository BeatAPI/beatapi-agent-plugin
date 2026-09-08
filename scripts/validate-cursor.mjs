import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fail(message) {
  throw new Error(message);
}

function readJson(relativePath) {
  const path = resolve(root, relativePath);
  if (!existsSync(path)) fail(`Missing Cursor plugin file: ${relativePath}`);
  return JSON.parse(readFileSync(path, "utf8"));
}

const manifest = readJson(".cursor-plugin/plugin.json");
const mcp = readJson("mcp.json");
const packageManifest = readJson("package.json");
const codexManifest = readJson(".codex-plugin/plugin.json");

if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(manifest.name)) {
  fail("Cursor plugin name must be lowercase kebab-case.");
}
if (
  manifest.name !== packageManifest.name ||
  manifest.name !== codexManifest.name
) {
  fail("Cursor, Codex, and package names must match.");
}
if (
  manifest.version !== packageManifest.version ||
  manifest.version !== codexManifest.version
) {
  fail("Cursor, Codex, and package versions must match.");
}

for (const field of ["logo", "skills", "mcpServers"]) {
  const relativePath = manifest[field];
  if (
    typeof relativePath !== "string" ||
    relativePath.startsWith("/") ||
    relativePath.includes("..")
  ) {
    fail(`Cursor manifest ${field} must be a safe relative path.`);
  }
  if (!existsSync(resolve(root, relativePath))) {
    fail(`Cursor manifest ${field} path does not exist: ${relativePath}`);
  }
}

const declaredVariables = new Set(
  Object.keys(manifest.variables?.properties ?? {}),
);
const requiredVariables = new Set(manifest.variables?.required ?? []);
if (!requiredVariables.has("BEATAPI_API_KEY")) {
  fail("BEATAPI_API_KEY must be a required Cursor plugin variable.");
}

const serializedMcp = JSON.stringify(mcp);
const placeholders = [
  ...serializedMcp.matchAll(/\$\{([A-Z][A-Z0-9_]*)\}/g),
].map((match) => match[1]);
for (const name of placeholders) {
  if (name !== "PLUGIN_ROOT" && !declaredVariables.has(name)) {
    fail(`Cursor MCP placeholder is not declared in variables: ${name}`);
  }
}
for (const name of declaredVariables) {
  if (!placeholders.includes(name)) {
    fail(`Declared Cursor variable is unused by mcp.json: ${name}`);
  }
}

const server = mcp.mcpServers?.beatapi;
if (
  server?.type !== "stdio" ||
  server.command !== "node" ||
  server.cwd !== "${PLUGIN_ROOT}" ||
  server.args?.[0] !== "./mcp/server.mjs"
) {
  fail("Cursor MCP server must launch the bundled stdio runtime from PLUGIN_ROOT.");
}
if (
  server.env?.BEATAPI_API_KEY !== "${BEATAPI_API_KEY}" ||
  server.env?.BEATAPI_BASE_URL !== "${BEATAPI_BASE_URL}"
) {
  fail("Cursor MCP environment must use declared variable placeholders.");
}
if (/sk_[A-Za-z0-9_-]{6,}/.test(serializedMcp)) {
  fail("Cursor MCP config contains a credential-like value.");
}

process.stdout.write(
  `Validated Cursor plugin ${manifest.name}@${manifest.version}.\n`,
);
