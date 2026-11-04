# MCP / OAuth 政策补充依据

状态：OAuth 补充已落实到 beatapi/src/content/pages/ 下英、中、日三语政策，并随网站 26eb4bb711de717a25769be95e23f3e0fbf81016 部署。2026-11-04 六个线上页面均匿名回读通过。网站正文是政策来源，本文件保留准备内容与实现依据，不替代法律审查。
后续运营变更仍需负责人核对，尤其是上游供应商处理、日志/生成文件保留和删除申请流程。

## Privacy Policy 补充英文正文

### Connected AI applications and OAuth

When you connect BeatAPI to an AI application such as ChatGPT, you sign in to
BeatAPI and approve the access scopes shown on the consent page. The connection
uses OAuth; you do not need to provide a BeatAPI API key in the conversation.

BeatAPI stores the connection's account association, client identifier, approved
scopes, authorization and expiry timestamps, revocation status, and spending-limit
settings and counters. OAuth authorization codes, access tokens and refresh tokens
are stored as credential hashes rather than their original values in the OAuth
credential columns. This statement does not describe the host application's own
credential storage.

When the connected application invokes a tool, BeatAPI receives the arguments
needed for that request, such as a research query, public source URL, prompt or
approved input-media URL. Depending on the capability, those inputs are processed
by BeatAPI and the relevant upstream service providers described in this policy.
Tool responses, task status and generated result links are returned to the
requesting application. Content returned to that application is also subject to
its own privacy terms and your settings there. Connecting BeatAPI does not itself
authorize access to private social messages or a social account's login session.

You can revoke a connected application's access in your BeatAPI account security
settings. Revocation prevents further authorized calls through that connection;
it is not a request to delete all prior tasks, results or accounting records.
Credential hashes may be retained until the associated authorization expires for
replay detection. Expired authorization records are removed by scheduled cleanup,
not necessarily at the instant of expiry. Existing retention rules for usage,
security, billing and generated files continue to apply. Contact
support@beatapi.io for privacy and deletion requests.

## Terms of Service 补充英文正文

### Connected applications

You may authorize a supported application to invoke BeatAPI capabilities on your
behalf within the permissions you approve. Available capabilities depend on the
connected service, your permissions and applicable provider rules. Capability
catalog Search and Inspect are free; executing research queries, models or media
workflows may consume your existing BeatAPI balance at the applicable rates.

A connection's daily spending limit restricts spending through that connection,
not all activity on your account. A limit of zero means no daily connection limit.
You can change the limit or revoke access in account security settings. Revoking
access does not undo work already submitted or guarantee cancellation or refund
of an in-progress upstream task. The plugin does not sell credits, initiate
top-ups or process payments within the connected application.

## 实现依据与待确认项

| 事项 | 当前代码依据 / 待确认 |
| --- | --- |
| 授权关联、scope、期限、撤销和限额 | beat-new-api/model/beat_mcp_oauth.go |
| 凭证摘要与到期清理 | beat-new-api/service/mcpoauth/store.go；不承诺日志全局无敏感信息 |
| 用户自行撤销和修改限额 | beat-new-api/service/mcpoauth/consent.go 与现有账户安全页 |
| 输入/结果经连接传递 | beat-new-api/service/beatmcp/server.go、dispatch.go；能力执行仍走现有网关 |
| 上游及保留策略 | 沿用当前网站政策，但仍需负责人确认与实际供应商、日志/文件配置相符 |
| 删除申请处理 | 既有政策指向 support@beatapi.io；处理时限和额外法律承诺未编造 |

不要把“撤销”写成“立即删除全部记录”，也不要把“凭证字段仅存摘要”扩张成
“全系统任何地方都不会记录敏感信息”。未核实的零保留、不训练和地域承诺不能加入。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
