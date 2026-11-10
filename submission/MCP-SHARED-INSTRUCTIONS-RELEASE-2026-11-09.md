# 共享执行指引支持单独上线

> 2026-11-09。用户授权只发布可选共享指引支持，保持当前内置目录，不激活 986 工具候选、不提交审核。

## 发布

- 仓库 `fengshao1227/beat-new-api`，main 提交 `1795d70ef958cf2e9ed55594867d718f569c2dfa`。
- 在基于最新远端 `7f824518cc8e5838e1864848afa6da3bbad10d63` 的独立工作区提交，不覆盖原工作区的未提交修改，也未推送插件仓库其他候选修改。
- [部署 42569548234](https://github.com/fengshao1227/beat-new-api/actions/runs/42569548234) 成功；日志确认 blue 健康后切流、旧 green 排空，2026-11-09 14:02:04 北京时间确认 `blue live at 1795d70ef`。
- 原网关目录仅列出的五个未提交文件保持原状。独立发布工作区在 `/tmp/beat-mcp-shared-instructions-20261109`，原工作区不强制重置或自动清理。

## 变更边界

仅 `service/beatmcp/catalog.go` 读取目录可选 instructions，`server.go` 把它透传给 MCP SDK 初始化响应；现有 `server_test.go` 补充真实 SDK 测试，更新两个层级的 AGENTS 文档。共五个文件。

内置 `catalog_default.json`、`result_schema.json`、`results.html`、目录选择设置及执行绑定没有改动；未改 OAuth、参数校验、账务、模型接线、任务归属或数据库结构。正式目录仍使用用户截图确认的内置目录；未访问管理设置写接口，未上传目录。

共享指引支持是可选字段消费能力，不是把候选指引硬编码进生产。当前内置目录没有 instructions，所以正式 initialize **仍然不返回该字段，这是预期的旧目录兼容行为**。含指引时逐字透传已通过隔离的真实 SDK 测试；本轮未为证明这一分支而切换生产目录，不冒充新指引已在正式宿主生效。

## 验证

- `go test -race ./service/beatmcp -count=1` 通过，包含有/无共享指引、匿名初始化、输出 Schema、权限和分页等回归。
- 三项 router 回归通过：关闭协议不回退管理 HTML、OAuth/钱包/幂等隔离、任务归属边界。使用隔离测试数据，不调用付费模型。
- `go vet ./service/beatmcp`、`git diff --check` 通过。
- 完整 Go 入口编译通过；独立工作区使用本机已有的前端 dist 满足 embed 依赖，不将此称为最新前端构建验收。正式 Docker 部署重新构建完整产物并通过健康门禁。
- 部署前后独立匿名读取全部 10 页工具列表，**988 个完整描述符深度相等**，不是仅比较数量；名称、参数、权限、说明与 UI 关联均未变化。
- initialize、resources/list 和 resources/read 的完整内容前后相等；UI HTML 未变。
- 公共 `/api/status` 200，部署流程验证 Craft 执行路由匿名 401，未降低鉴权要求。

工具列表 JSON 摘要前后一致：`a3e2ca253963227f515753df7faa0141ae7ddc7d628e08aea0af2a4a74b61e05`。
展示资源内容 JSON 摘要前后一致：`ce50a287734302e04aba748d29c3c9fbf6ce8fbafc6e9f6e30cf00ff8169fee7`。

## 回滚与后续

前一成功部署版本为 `7f824518cc8e5838e1864848afa6da3bbad10d63`。本次没有目录或数据库迁移，代码回退不要求切换目录；如需回退，应按既有发布流程恢复这一已知代码版本，或对本次提交创建反向提交并重新部署。未实际执行回滚，也不保证旧容器永久保留；部署脚本会停止排空的旧实例。

旧 `admin.beatapi.io` 的 520 对应仓库记录的退役域名 return 444，不因本次发布修改 DNS、CF 或 nginx 防护。未请求后台登录或读取管理员凭证。

本轮止于共享指引支持部署与旧目录无变化验收：没有激活 986 候选，没有更新 OpenAI 草稿、触发 MCP 扫描或提交审核，没有执行付费业务测试。后续目录切换仍须单独授权。

证据：`submission/artifacts/mcp-shared-instructions-release-20261109/` 中的前后完整快照、摘要断言和 release.json。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
