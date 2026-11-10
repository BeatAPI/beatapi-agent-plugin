# MCP 扫描未完成排查

## 结论

2026-11-08 补充：独立元数据审计已发现我方 UI origin、结构化输出声明、默认值/命名示例及格式兼容性缺项，并复现 OpenAI/ChatGPT Origin 请求的 403。当前不能再沿用下方历史记录中的“偏向扫描服务”倾向判断；先依据 `artifacts/mcp-metadata-audit-20261108/README.md` 处理本方可复现问题。未修改线上或提交审核。

2026-11-06 本轮只点击一次 Rescan。OpenAI 扫描任务被接受，随后以 `problem.code: unknown` 结束；这不是明确的工具审核拒绝。现有证据偏向扫描服务或兼容性环节异常，尚不足以确认最终根因，也不能排除只在扫描器环境出现的服务端问题。

未修改后端、OAuth 配置、工具目录或 ZIP，未填写审核员账户，未提交审核或发布。没有调用业务工具或产生生成任务。

## 已验证

- 官方 MCP SDK 匿名初始化、10 页 tools/list 成功，987 个工具与固定目录严格一致，名称、Schema、认证声明、风险提示和 UI 元数据均通过现有预检。
- `resources/read` 返回 `ui://beatapi/results-v1.html`，MIME 为 `text/html;profile=mcp-app`，与本机网关静态资源逐字一致。SHA256：`d3388a89f4d04b72bd39b7ef8409b918facabac0efcef7dac8ccd5eec5936eb1`。
- protected-resource 元数据及其声明的 issuer `https://api.beatapi.io/mcp/oauth` 对应授权服务器发现地址均返回 200。后者为 `https://api.beatapi.io/.well-known/oauth-authorization-server/mcp/oauth`，支持 S256、authorization_code、refresh_token 和公开客户端 `none`。
- 根路径 `/.well-known/oauth-authorization-server` 返回 404，但不是本服务声明的 issuer 的发现地址，不能据此认定 OAuth 配置错误。
- 门户仍显示 Authorized、Domain verified、Not submitted、Not published。

## 门户证据

- App：`asdk_app_6aed1b32cb0c81919339954cee14a350`。
- 原草稿：`appsub_6aed1b32cb488191a9700600724d1b1e`，未创建新插件或草稿。
- `POST continuous-review/rescan` 返回 HTTP 200，run ID：`01a1ae81-fa5c-7c7c-acd9-d268f0998266`，初始 state 为 running。
- 后续 `GET continuous-review` 返回 HTTP 200，`runtime.last_attempt.id` 与本轮 run 一致，完成时间为 `2026-11-06T01:38:51.464890+00:00`，`problem.code` 为 unknown，active_run 为 null。
- `all_tools_pass` 为 null；保留的 987 个工具 review 全部为 incomplete，findings/shared_findings 均为空。
- 返回的 scan_time 为 `2026-11-06T01:35:48.444334+00:00`，早于本轮尝试。它是旧扫描记录，不能冒充本轮成功发现或审核结果。
- 门户提示最新扫描未完成，展示旧结果；诊断下载按钮不可用。

证据位于 `artifacts/public-package-20261106-listing/scan-investigation.json`、`scan-investigation.png` 和 `scan-live-checks.json`。仅保存扫描返回及公开工具名称，不保存 Cookie、访问令牌或审核账户密码。临时页面请求观察代码已通过刷新移除。

## 未证明与下一步

本轮没有 OpenAI 扫描器内部日志、对应扫描请求的网关访问日志，也没有重新执行 OAuth 刷新/撤销测试。匿名预检通过不代表授权扫描或安全审核通过；987 个工具是否触发扫描器规模/耗时问题仍是假设，不能当成根因或据此删减工具。

下一步应将下方英文复现说明和去敏证据交给 OpenAI 支持方，要求按 run ID 查询内部失败阶段。若其指出访问失败或特定描述/schema，再对照该时段网关请求日志做定向修复。不要反复重传同一 ZIP、盲目重连或提交审核来试错。

## Support Draft

Subject: MCP scan accepted but terminates with problem.code unknown

Our existing, unsubmitted BeatAPI Agent Toolkit draft cannot complete its MCP scan. The portal shows Authorized and Domain verified. We are not requesting publication or review submission.

App ID: asdk_app_6aed1b32cb0c81919339954cee14a350

Draft ID: appsub_6aed1b32cb488191a9700600724d1b1e

MCP URL: https://api.beatapi.io/mcp/openai

Run ID: 01a1ae81-fa5c-7c7c-acd9-d268f0998266

The rescan POST returned HTTP 200 and state running at 2026-11-06T01:38:36.369Z. The subsequent status GET returned HTTP 200 with last_attempt.problem.code unknown and completed_at 2026-11-06T01:38:51.464890+00:00. The retained tool review has 987 tools, all incomplete, with no per-tool findings. The diagnostics download is disabled.

Independent anonymous MCP SDK checks complete initialization, paginated tools/list and the UI resources/read operation. The tool catalog matches our pinned definitions. OAuth protected-resource and issuer-specific authorization-server metadata both return HTTP 200. These checks do not verify your authenticated scanner runtime.

Could you inspect this run and identify the failing stage, including any upstream HTTP/protocol/schema error or internal service failure? Please also confirm whether a documented tool-count or metadata-size limit applies. We have not changed the server to work around an unknown error.

官方参考：[提交和重新扫描](https://developers.openai.com/plugins/deploy/submission)、[提交错误说明](https://developers.openai.com/plugins/deploy/submission-errors)、[故障排查](https://developers.openai.com/plugins/deploy/troubleshooting)。官方要求成功且当前的 MCP 扫描，不因本机预检通过而豁免。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
