# MCP 扫描未完成：请求时间线排查

> 2026-11-08。只读排查；未修改线上、部署、重连、重扫、提交审核或运行付费工具。新增的两个 initialize 对照不涉及账户或能力执行。

## 当前定位

更新：后续授权的透明边缘诊断已捕获具体拒绝分支，并撤掉路由，见 `MCP-EDGE-TRACE-2026-11-08.md`。Python POST 对应固定错误 `Invalid MCP request`，不是 Accept 检查错误；下面 Accept 部分保留为当时未证实的假设，不再作为该 400 的解释。扫描 unknown 的唯一根因仍未证实。

已将问题从笼统的“扫描失败”缩小到：**OpenAI 主客户端完成目录/资源发现后，同一窗口出现一个 Python 子客户端的源站 HTTP 400；随后后台将本轮扫描记为 unknown、所有工具 incomplete。**

这个 400 是目前最具体的异常线索，但尚未取得其原始 HTTP 方法、请求头及错误正文，不能把时间先后直接当成已证明的因果关系。

## OpenAI 后台的真实运行状态

从页面实际发出的只读 GET `/v1/dashapi/apps/asdk_app_6aed1b32cb0c81919339954cee14a350/continuous-review` 读取，不是仅看界面文案：

- 状态接口本身返回 HTTP 200，不是已观察到的后台 HTTP 500。
- 查询请求 ID：`req_a4ccbf5460824fccaff9b9786dd143f3`，这是读取状态的请求，不是原始失败请求。
- scan ID：`asdk_app_6aed1b32cb0c81919339954cee14a350~AppsSDKContinuousScan_43dd278ad03c819184434647e0cb4dd9`。
- attempt ID：`01a1b912-f8cc-778a-9173-1a2d7204bb06`。
- `scan_time`：`2026-11-08T02:53:25.438856+00:00`。字段没有标为 start，不能将它当作实际开始时间计算耗时。
- `last_attempt.completed_at`：`2026-11-08T02:53:26.946138+00:00`，`problem.code: unknown`，无具体 message。
- `active_run: null`：本轮已结束，不是还在排队等待。
- 已保存 988 个工具定义，988 个 output_json_schema；两个读取工具的模板元数据也已保存独立域和 CSP。
- 988 个工具均为 `review: incomplete`，findings 与 shared_findings 均为空，`all_tools_pass: null`。这是“没有完成检查”，不是“全部通过”，也不是 988 条确定的 Schema 违规。

## Cloudflare 请求记录与源站状态

通过 CF CLI 定位到 BeatAPI 区域，读取现有 `events.httpRequests`，精确过滤 `api.beatapi.io`、`/mcp/openai`、02:52–02:54 UTC。下列行的 `sampleInterval` 均为 1；这些是边缘记录中报告的源站状态，不冒充已经读取 nginx 或 Docker 原始日志。

| UTC 时间 | 客户端 | 源站 / 边缘状态 | 观察 |
| --- | --- | --- | --- |
| 02:53:12–02:53:18 | `openai-mcp/1.0.0` | 12 条均 200 | 返回体量与 10 个工具分页、资源列表及约 746 KB 的 HTML 响应相符；RPC 方法归类由体量和门户保存结果推断，记录本身没有 JSON-RPC 方法字段。 |
| 02:53:18 | `Python/3.13 aiohttp/3.14.4` | 400 / 400 | Ray ID `a57149603c7ece64`；源站耗时 108 ms，edgeResponseBytes 745。 |
| 02:53:26.946 | OpenAI 状态记录 | `unknown` 终态 | 所有工具 incomplete，未给出具体错误正文。 |

主客户端请求均到达源站并返回 200，异常行同样报告 `originResponseStatus: 400`；该行不支持“Cloudflare 直接 WAF 拦截、源站完全没收到”的判断。没有看到主客户端的 401/403/429/5xx，不能把这次失败归因为登录失败、额度不足或源站 500。

同一窗口还有我们自己的 `curl/8.7.1` 验收请求，已通过 UA 与扫描流量分开；其中 GET 405 属于无 SSE 流支持，不能拿它当作 OpenAI 扫描错误。

## Accept 对照：可复现但尚未归因

仅用同一个匿名 initialize 请求，改变 Accept：

| Accept | HTTP | 响应 |
| --- | --- | --- |
| `application/json` | 400 | `Accept must contain both 'application/json' and 'text/event-stream'` |
| `application/json, text/event-stream` | 200 | 正常 InitializeResult |

这是安装的 Go MCP SDK 1.8.0 的协议检查；[MCP 2025-06-18 传输规范](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#sending-messages-to-the-server) 同样要求客户端声明两种类型。

因此请求头兼容是值得优先核查的假设，但**不能声称原 Python 请求一定缺 Accept**。400 也可能来自协议版本、URL 查询、无效 RPC 等。原始请求正文未知，Python UA 归属扫描子步骤也主要依据时间相邻和主客户端发现已完成的证据推断，不冒充已看到 OpenAI 内部调用栈。响应总字节数不能用于确定错误正文。

## 尚缺的证据与下一步

本机 `ssh oracle` 没有对应 Host 配置，实际尝试连接被关闭；未取得 nginx/access.log 或容器日志访问。已向用户询问正确 SSH 别名、配置路径或运维后台，不索要聊天中的私钥/密码。

本次可见的 Cloudflare 目录未列出可用的 HTTP 原始日志数据集；这不证明该产品不存在。`clientRequestQuery` 字段查询也返回 403。未升级权限、绕过限制或启用新日志。因此未读取原始请求方法/头/体，不把缺失的数据写成确定结论。

获得源站入口后优先查：

1. `/var/log/nginx/access.log` 中 2026-11-08 02:53:18 UTC、路径 `/mcp/openai`、UA 为 Python/3.13 aiohttp/3.14.4 的 400 行，确认 HTTP 方法与原始路径；注意服务端日志可能使用不同时区。
2. `beat-new-api-green` 的同期请求日志及错误行，尝试对应 request ID；Cloudflare Ray ID 不一定被当前日志格式保存，不能保证可直接按 Ray 搜到。
3. 若现有日志没有协议头/错误原因，先说明缺口再申请一次只记录方法、Accept、协议版本、Content-Type、RPC 方法及错误码的窄范围诊断；不记录 Authorization、Cookie、令牌、RPC 参数正文，不盲目放宽鉴权或协议校验。

当前没有足够证据安全修改线上。没有再次点击 Rescan，后台保持 Not submitted。

## 本机归档

`submission/artifacts/mcp-scan-diagnosis-20261108/`：脱敏后台状态、时间线、Ray ID、源站状态和两个免费对照结果。它们不进入公开插件 ZIP。

## 补充：技术截图与无需 SSH 的方案

用户提供的截图对应北京时间 09:58–10:00，不是上述 10:53 扫描。按 2026-11-08 的对应窗口单独查询 CF，主客户端的 12 条 200 与截图一致，最后一条为 09:59:12 的约 746 KB 响应。此外还发现两条未在截图主链路中列出的记录：

- 09:58:29，`Python/3.14 aiohttp/3.14.4`，源站/边缘均 400，Ray `a570f9126e324493`。
- 09:59:29，同 UA，源站/边缘均 400，Ray `a570fa89da116d98`。

两轮应分别分析，不能拼成一个请求链。额外 400 可能属于辅助检查，也可能是预期拒绝的探测；重复出现不等于已证明导致扫描失败。截图的“主链路均成功”与这些额外记录可以同时成立。

CF 只读复核：beatapi.io 所属账号已核对（ID `8529f0937781e0e44cb0075dc64c46e2`）；区域 active，api.beatapi.io 为已开启代理的 A 记录。未修改 DNS、Workers 路由或安全规则。账号个人邮箱不进入源码归档。

建议在获得明确授权后，使用短期、精确路径的透明诊断 Worker，仅覆盖 `api.beatapi.io/mcp/openai`。按 [Cloudflare Routes 官方说明](https://developers.cloudflare.com/workers/configuration/routing/routes/)，现有服务器仍作为源站，Worker 可将原请求直接交给 fetch 转发，不需要 SSH，也不需要迁移后端。

实施前必须确认现有 Worker 路由/配置归属，避免覆盖域名验证等既有功能；测试正文流式转发、原响应状态/头及异常处理，不缓存、不重试业务请求、不改变工具目录、OAuth 或校验规则。仅记录方法、路径、Accept、Content-Type、协议版本、可安全提取的 RPC 方法和状态/耗时；错误响应只保留经过白名单与脱敏的短协议错误，不记录 Authorization、Cookie、令牌、RPC 参数或生成内容。透明转发仍是线上变更，不承诺零风险。

先观察一次扫描并撤掉诊断路由；只有捕获到原始 400 原因，才决定是否需要通用协议兼容修复。若传输全部正常，再在独立测试入口对比小目录/无 UI 与完整目录/完整 UI，不修改正式草稿的连接地址，也不按扫描客户端隐藏功能。目前未执行这些变更或新扫描。

官方文档未在本次查阅页面给出可用来判定本例的工具总数/组件大小硬限制，不能直接把 988 个工具或 745 KB 组件认定为根因。工具及组件导入与后续自动检查是不同步骤，见 [OpenAI 工具扫描元数据说明](https://developers.openai.com/plugins/deploy/app-review#metadata-stored-during-tool-scanning)。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
