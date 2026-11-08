# MCP 元数据修复发布与重扫

> 2026-11-08，用户授权：复核影响后提交部署，重跑同一草稿 MCP 扫描，不提交审核。

## 发布状态

- 插件：`3c9d63ca7d2ec03bc193df6515e2d0f12dc1640e`，已推送 `BeatAPI/beatapi-agent-plugin` 的 main；[CI 42439699953](https://github.com/BeatAPI/beatapi-agent-plugin/actions/runs/42439699953) 成功。
- 网关：`a52903b7082817ad299c3070c95c8899bc9fdf2a`，已推送 `fengshao1227/beat-new-api` 的 main；[部署 42439549949](https://github.com/fengshao1227/beat-new-api/actions/runs/42439549949) 成功。
- 部署日志明确记录 green 实例健康后切流、旧 blue 实例排空并停止；2026-11-08 02:51:39 UTC 确认 green live at a52903b70。
- 本次没有重传插件 ZIP、修改 OAuth 客户端、重连账户、修改审核资料、提交审核或发布插件。

## 影响复核

发现原网关工作区落后于远端，先在远端最新主线 `3b33c96b4` 的隔离工作区整合修复，未用旧目录覆盖已上线的模型重命名、模型参数或其他改动。

本次网关提交仅含 `service/beatmcp/` 的协议实现、目录、共享 Schema、测试和两层 AGENTS 文档。与该最新主线相比：

- 保留的 984 个执行绑定及其 schemaHash/mode/权限均不变。
- 去除说明、示例、默认值注解及原已知 image-size 格式后，全部保留工具的输入验证约束深度相等；没有转换调用值，也没有新增比例限制。
- 唯一移除的 MCP 工具仍是含 password/writeOnly 输入的 YouTube get_video_streams_v3；REST 接口未变。
- 最新主线原 987 个目录工具变为 986 个，加匿名发现工具共 988 个。上一份本地修复报告的 986 总数属于更旧基线，不是这次部署覆盖模型的结果。
- 未改价格/计费、钱包、OAuth、Origin 白名单、任务归属、幂等、REST 或数据库迁移。部署仍会重建网关实例，已使用原蓝绿流程保护在途请求，不能把测试结论表述为对所有生产情形的零风险保证。

## 验证结果

- 网关完整后端入口构建、MCP 模块 go vet、`go test -race ./service/beatmcp` 通过。
- 真实 SDK 完整读取最终 988 个工具通过；router 的 OAuth/钱包/幂等、任务归属及关闭路由三项回归通过。
- 插件精确提交在独立 checkout、锁定依赖下 `npm run verify` 通过：47 个主测试、16 个 Harness 测试。原工作区另有一个先前展示文案回归，未混入本次提交；该工作区的 48 个测试也在上一阶段通过。
- 原插件工作区的先前文案、提交材料、域名验证等未提交修改保留，未夹带到本次源码提交。
- 原网关工作区已快进同步至发布提交；较旧本地修改保留为具名 Git stash 备份，没有覆盖远端改动。
- 上线独立复验：`/api/status` HTTP 200，原 Craft 执行入口匿名 HTTP 401。
- 官方 MCP SDK 经匿名只读传输逐项验证全部 988 个线上工具、OAuth 元数据及 UI 域/MIME/CSP 与最终目录一致；目录摘要 `0347a0fc2aadf1a26a51aadd7d9020af59cd47f1af4f4bf1ab8a05c3ca4f1b5b`。
- 原生 Node fetch 曾报网络错误；没有改线上超时或证书策略，改用受限 curl 传输供同一官方 SDK 完成独立复验。请求限于 initialize、tools/list、resources/list/read 和 OAuth well-known，没有凭证和 tools/call。GET MCP HTTP 405 是无 SSE 流支持，SDK 后续 POST 分页均成功。

## 门户扫描结果

同一正式插件 `plugin_asdk_app_6aed1b32cb0c81919339954cee14a350`，MCP key `beatapi`，地址 `https://api.beatapi.io/mcp/openai`。

仅点击一次 Rescan，观察到 Starting MCP scan → Scanning your MCP server → The latest scan did not complete。2026-11-08 02:54:56 UTC 确认终态：

- 授权 Authorized、域名 Domain verified 仍通过。
- Copy findings 包含 988 个工具，全部只给出 `Some checks did not finish. These findings are partial.`，没有具体参数或 Schema 违规理由。
- 新目录排除的 get_video_streams_v3 已不在这 988 项中，说明门户工具清单已反映新版本；不等于后续检查完成。
- 下载 diagnostics 按钮不可用；已保存界面 Copy findings 原文和截图，不编造不存在的诊断细节。
- Review status 仍为 Not submitted，Publication 为 Not published。

结论：代码已部署，已确认的元数据兼容性问题在线复验通过；OpenAI 门户本轮扫描仍未完成。现有证据不能证明是哪一方的唯一根因，不应标记为送审就绪或反复盲目重扫。

## 本机证据

`submission/artifacts/mcp-release-20261108/` 包含 `online-preflight.json`、`deploy.log`、`portal-findings.json`、`portal-scan-result.png`；这些诊断与内部日志不进入公开 ZIP。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
