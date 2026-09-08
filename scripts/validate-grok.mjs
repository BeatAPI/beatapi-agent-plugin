import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readJson(relativePath) {
  const path = resolve(root, relativePath);
  if (!existsSync(path)) fail(`Missing Grok plugin file: ${relativePath}`);
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${relativePath}: ${error.message}`);
  }
}

const manifest = readJson(".grok-plugin/plugin.json");
const packageManifest = readJson("package.json");
const mcp = readJson(".mcp.json");

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.name ?? "")) {
  fail("Grok plugin name must be lowercase kebab-case.");
}
if (manifest.name !== packageManifest.name) {
  fail("Grok and package names must match.");
}
if (manifest.version !== packageManifest.version) {
  fail("Grok and package versions must match.");
}
for (const field of ["description", "homepage", "repository", "license"]) {
  if (typeof manifest[field] !== "string" || !manifest[field].trim()) {
    fail(`Grok manifest ${field} is required.`);
  }
}
for (const field of ["skills", "mcpServers", "logo"]) {
  const relativePath = manifest[field];
  if (
    typeof relativePath !== "string" ||
    !relativePath.startsWith("./") ||
    relativePath.includes("..")
  ) {
    fail(`Grok manifest ${field} must be a safe relative path.`);
  }
  if (!existsSync(resolve(root, relativePath))) {
    fail(`Grok manifest ${field} path does not exist: ${relativePath}`);
  }
}

const server = mcp.mcpServers?.beatapi;
if (
  server?.command !== "node" ||
  JSON.stringify(server.args) !== JSON.stringify(["./mcp/server.mjs"]) ||
  server.cwd !== "."
) {
  fail("Grok MCP server must launch the bundled stdio runtime from the plugin root.");
}
if (!Array.isArray(server.env_vars) || !server.env_vars.includes("BEATAPI_API_KEY")) {
  fail("Grok MCP config must inherit BEATAPI_API_KEY from the host environment.");
}
if (/sk_[A-Za-z0-9_-]{6,}/.test(JSON.stringify({ manifest, mcp }))) {
  fail("Grok plugin files contain a credential-like value.");
}

const readme = readFileSync(resolve(root, "README.md"), "utf8");
for (const requiredText of [
  "Grok Build",
  "grok plugin install",
  "BEATAPI_API_KEY",
  "https://api.beatapi.io",
]) {
  if (!readme.includes(requiredText)) {
    fail(`README is missing Grok setup detail: ${requiredText}`);
  }
}

process.stdout.write(`Validated Grok Build plugin ${manifest.name}@${manifest.version}.\n`);
