/**
 * [INPUT]: 本地 MCP TypeScript 入口与锁定依赖，使用 esbuild 生成单文件产物
 * [OUTPUT]: mcp/server.mjs 或源码/依赖与既有产物的逐字节一致性检查
 * [POS]: 本地安装包的生成边界；SDK 升级导致的 bundle 改动不应手动维护
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { build } from "esbuild";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outfile = resolve(root, "mcp/server.mjs");
const check = process.argv.includes("--check");
const result = await build({
  entryPoints: [resolve(root, "mcp/src/server.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node20",
  write: false,
  sourcemap: false,
  minify: false,
  legalComments: "none",
});
const output = result.outputFiles?.[0]?.contents;
if (!output) throw new Error("esbuild did not produce the MCP server bundle.");

function bundleMismatchDetails(current, generated) {
  generated = Buffer.from(generated);
  const limit = Math.min(current.length, generated.length);
  let offset = 0;
  while (offset < limit && current[offset] === generated[offset]) offset += 1;
  const line = current.subarray(0, offset).toString("utf8").split("\n").length;
  const start = Math.max(0, offset - 120);
  const end = offset + 240;
  const digest = (value) => createHash("sha256").update(value).digest("hex");
  return [
    `first difference: byte ${offset}, line ${line}`,
    `committed: ${current.length} bytes, sha256 ${digest(current)}`,
    `generated: ${generated.length} bytes, sha256 ${digest(generated)}`,
    `committed snippet: ${JSON.stringify(current.subarray(start, end).toString("utf8"))}`,
    `generated snippet: ${JSON.stringify(generated.subarray(start, end).toString("utf8"))}`,
  ].join("\n");
}

if (check) {
  if (!existsSync(outfile)) {
    throw new Error("mcp/server.mjs is missing. Run npm run build.");
  }
  const current = readFileSync(outfile);
  if (!current.equals(output)) {
    throw new Error(
      `mcp/server.mjs is stale. Run npm run build.\n${bundleMismatchDetails(current, output)}`,
    );
  }
  console.log("MCP server bundle is current.");
} else {
  writeFileSync(outfile, output);
  console.log(`Built ${outfile}.`);
}
