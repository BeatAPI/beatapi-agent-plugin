# 临时 MCP 透明诊断

仅代理 `https://api.beatapi.io/mcp/openai`，不改 DNS、OAuth、业务参数或目录。部署前读测试、核对现有路由，确认不会覆盖其他 Worker。诊断窗口截止后自动停止观察，但路由仍须撤掉。

平台自动 invocation 日志和 tracing 关闭；显式日志只包含协议白名单。Authorization、Cookie、RPC 参数、查询值和任意错误正文均不记录。只有已知协议错误分类会保存。

验证顺序：`npm test` → `cf deploy --dry-run` → 部署 → 免费 initialize 的 JSON-only/JSON+SSE 对照 → 确认 Worker 日志与响应一致 → 同一正式草稿 Rescan 一次 → 保存诊断 → 删除本 Worker 的精确路由 → 验证源站恢复直达及域名验证路由未变。

不运行付费 tools/call，不提交审核，不按扫描客户端改变响应。不能把 HTTP 400 自动视作扫描根因；需要与后台本轮 attempt/time 对齐。

## 2026-11-08 本轮状态

已用版本 `d3b77081-6f6a-4d00-80ee-4e58b3b5c3de` 完成 6 项本地回归、3 项上线对照及一次正式草稿重扫。捕获 Python POST 的已知协议错误分类对应 `Invalid MCP request`，并非 Accept 检查错误；另用空 POST 免费复现同一拒绝响应，但未记录原请求正文，不能认定其正文为空。

03:29:05 UTC 已删除本 Worker 的路由 `54dd0533134840fb9fdd8ff9131e9e84`；目前不接管生产请求。Worker 代码版本作为诊断来源保留，workers.dev 和预览地址关闭。原域名验证路由未动，撤销后 MCP 初始化及域名验证均返回 200。完整结果见 `../MCP-EDGE-TRACE-2026-11-08.md`。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
