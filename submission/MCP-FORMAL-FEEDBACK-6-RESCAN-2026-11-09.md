# 六项展示修复后的独立完整目录复扫

后续正式目录更新及同一正式草稿重扫已另经用户授权完成，见 MCP-FORMAL-SIX-RELEASE-2026-11-09.md；下文“正式未改动”仅描述本轮独立诊断阶段。

> 2026-11-09，北京时间。仅更新既有独立诊断 Worker，复用既有独立草稿；不修改正式端点或正式草稿，不提交审核，不调用付费业务工具。

## 结果

- **986/986 工具 complete**，共享 instructions complete 且无 findings。新 attempt 已结束，activeRun=null、problem=null，没有 unknown。
- 六项修复工具的原名称/说明具体反馈 **全部未再标记**。Bilibili 视频榜的全部 findings 为空；Lemon8、皮皮虾、小红书内容榜和两项知乎工具各有一条通用“需进一步审核”提示，不再给出名称/说明不清的理由。
- `capabilities_search` 与 `capabilities_inspect` 均 complete，全部 findings 为空；两项“可能执行未公开操作”的反馈本轮未再标记。
- 全目录 **零具体反馈**，另有 **852 条通用进一步审核提示**，allToolsPass=null。这不是审核通过，也不是正式目录反馈已清除。

独立草稿的旧目录此前也曾获得零具体反馈，而正式草稿仍有具体反馈，因此不能把本轮结果全部归因为六项文案修改，也不能保证正式重扫必然相同。两项发现工具的解释仍以代码与回归测试为依据，不把扫描未标记当作官方认可。

## 扫描身份

- 复用独立插件：`plugin_asdk_app_6af04252daf48191b4656176b44669c1`，MCP key `diagnostic`。没有创建新插件，没有上传或覆盖正式 ZIP。
- endpoint：`https://api.beatapi.io/mcp/scan-controls/single-text`；部署配置显式指定 `ACTIVE_CONTROL=full-ui`，对所有客户端返回相同完整目录和原 UI。
- Worker version：`bd36242e-e1f1-4fb5-9be5-877768ee29b4`；deployment：`6b1cd302-4058-4b52-a5a1-0826de8c4643`。自动截止时间为 2026-11-09 20:00 北京时间，实际提前撤路由。
- scan：`asdk_app_6af04252daf48191b4656176b44669c1~AppsSDKContinuousScan_7f092d19e8288191a09fe33cea08eeab`。
- attempt：`01a1c017-ec54-7d8c-8d5c-5fdb0b6564cd`。
- Rescan 点击于 19:35:51；scan_time 19:38:32；completedAt 19:40:13。只点击一次。首次页面等待 150 秒超时后继续等待同一 attempt，没有重复触发扫描。

## 保真与测试

使用上一轮六项修复的冻结快照，未按新全量契约重新编译能力。982 个固定执行绑定、两个读取工具、两个发现工具，共 986 工具；所有 Schema、默认值、枚举、参数边界、nullable、权限、annotations、共享指引和 UI 保留。仅沿用已核实的六项展示修订与四个技术名迁移，不另增别名或隐藏能力。

独立诊断服务的业务调用全部拒绝，不连接账户或源站；它只用于元数据扫描，不等于真实 OAuth 或业务执行联调。运行期未按用户代理或扫描器身份改变目录。

- 独立 Worker 5 项回归通过，涵盖分页、组件、共享指引、到期关闭、业务拒绝和路径边界。
- CF dry-run 构建通过后部署；实际活动部署读回与版本一致。
- 匿名读取诊断端点十页，共 986 个描述符，与冻结快照逐项相等；initialize instructions、资源列表、UI HTML 及元数据相等。
- 门户返回的 986 个 action_name/title/description/input/output Schema、annotations 和认证声明与候选逐项相等；共享 instructions 相等。按六项新名称逐项匹配，且 attempt 不同于扫描前保存的旧结果。
- 本轮没有改产品源码、网关内置目录、DNS、OAuth 客户端或审核账号资料。

## 清理与生产边界

精确删除本轮唯一诊断路由 `87220142dcfa42f3b246b5fcd7b9b30b`，读回的剩余路由与部署前完全一致。域名验证路由 `04dd926d699240c6831d72824947f1e4` 保留。

撤销后只读复验确认：正式端点全部 986 个描述符、initialize、资源列表与 UI 正文与扫描前逐项相等；诊断路径 404、域名验证 200、网关健康 200，结果见 `formal-after.json`。独立草稿保持 Not submitted / Not published，未发起误判申诉、正式重扫或提交审核。Worker 保留供复用，workers.dev/preview URL 仍关闭，临时诊断路径已撤销。

证据：`artifacts/mcp-formal-feedback-6-rescan-20261109/`，主要查看 `comparison.json`、`portal-after.json`、`preflight.json`、`cleanup.json` 和 `formal-after.json`。后续若要把这版修复用于正式草稿，仍需另行授权正式目录更新与正式扫描。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
