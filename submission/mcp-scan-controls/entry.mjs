/**
 * [INPUT]: 固定公开快照与诊断处理器
 * [OUTPUT]: CF fetch 入口
 * [POS]: 构建期快照接线，不在线读取正式端点
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import snapshot from "./snapshot.json" with { type: "json" };
import { createHandler } from "./worker.mjs";
export default { fetch: createHandler(snapshot) };
