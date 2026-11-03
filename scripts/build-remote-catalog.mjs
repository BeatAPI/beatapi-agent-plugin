/**
 * [INPUT]: 匿名网关 Search 全量分页，或操作者指定的完整契约 JSON 数组
 * [OUTPUT]: 工具和绑定、exclusions 及公开源契约快照；默认写入 ignored dist
 * [POS]: 只读目录构建命令；不调用 Run，不生成或部署新的后端服务
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import { compileRemoteCatalog } from "./remote-capabilities.mjs";

const { values } = parseArgs({ options: { fetch: { type: "boolean" }, catalog: { type: "string" }, output: { type: "string" } } });
if (Boolean(values.fetch) === Boolean(values.catalog)) throw new Error("Choose --fetch (anonymous catalog only) or --catalog <contracts.json>.");
let contracts;
if (values.catalog) {
  contracts = JSON.parse(readFileSync(resolve(values.catalog), "utf8"));
} else {
  contracts = [];
  const cursors = new Set();
  let cursor;
  let total;
  do {
    const response = await fetch("https://api.beatapi.io/v1/capabilities/search", {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(35_000),
      headers: { "content-type": "application/json", "x-beat-client": "mcp" },
      body: JSON.stringify({ query: "", view: "full", limit: 50, ...(cursor ? { cursor } : {}) }),
    });
    if (!response.ok) throw new Error(`Catalog discovery failed: HTTP ${response.status}`);
    const page = (await response.json()).data;
    if (!Array.isArray(page?.data) || !Number.isSafeInteger(page.total) || page.total < 1 || page.total > 20_000) throw new Error("Invalid catalog page.");
    total ??= page.total;
    if (page.total !== total) throw new Error("Catalog changed during pagination; rerun discovery.");
    contracts.push(...page.data);
    cursor = page.next_cursor;
    if (cursor && (typeof cursor !== "string" || cursors.has(cursor) || page.data.length === 0)) throw new Error("Catalog pagination did not advance.");
    cursors.add(cursor);
    if (contracts.length > total) throw new Error("Catalog pagination exceeded its declared total.");
  } while (cursor);
  if (contracts.length !== total) throw new Error("Incomplete catalog; refusing partial tool generation.");
}
const catalog = compileRemoteCatalog(contracts);
const path = resolve(values.output ?? "dist/submission/remote-catalog.json");
mkdirSync(dirname(path), { recursive: true });
if (values.fetch) {
  const snapshot = path.endsWith(".json") ? path.slice(0, -5) + ".contracts.json" : path + ".contracts.json";
  writeFileSync(snapshot, JSON.stringify(contracts, null, 2) + "\n");
  console.log(`Public contract snapshot: ${snapshot}`);
}
writeFileSync(path, JSON.stringify(catalog, null, 2) + "\n");
console.log(`Generated ${Object.keys(catalog.bindings).length} independent capability tools, ${catalog.tools.length} total tools; excluded ${catalog.excluded.length}.`);
console.log(path);
console.log("Build artifact only: the OAuth server must enforce these bindings and adapt next; no deployment or review is implied.");
