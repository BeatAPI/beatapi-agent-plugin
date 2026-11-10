# 正式 986 工具目录更新与同一草稿重扫

> 2026-11-09。用户授权先备份、确认回滚，再部署冻结目录、更新同一插件草稿并扫描；不提交审核。

## 完成状态

- 网关 main：`cd3010a02465db193708272f326b4cdaf36baa9b`，仅三个文件：内置目录、同源紧凑结果 Schema、模块 AGENTS。
- [部署 42580836643](https://github.com/fengshao1227/beat-new-api/actions/runs/42580836643) 成功，日志确认 15:56:03 北京时间 `green is live at cd3010a02`，健康检查和匿名 Craft 401 检查通过。
- 生产正式端点完整列出 **986 工具**；每个完整描述符与冻结候选相等，initialize 逐字返回共享执行指引，原 UI 内容不变。
- 原插件 `plugin_asdk_app_6aed1b32cb0c81919339954cee14a350`、原 app、beatapi MCP key、OAuth 客户端和 endpoint 均保留。0.4.0 草稿重传后，关闭缓存并重新下载的 manifest 与更新包相等。
- 正式扫描 **986/986 complete**、共享指引 complete，运行 problem=null、activeRun=null，不再是 unknown。但有 14 条具体反馈及 315 条通用进一步审核提示，**不是审核通过或可立即送审的结论**。
- 门户显示 Configured、Authorized、Domain verified、Not submitted、Not published；未点击提交审核或发布。

## 备份与回滚

备份目录：`submission/artifacts/mcp-formal-986-release-20261109/`。

- `catalog-before.json`：发布前内置目录逐字备份，SHA256 `00d987460030c370747835726b0497899437dbf92451fc49d361d4f7e54ab596`。
- `result-schema-before.json`：发现工具/旧目录兼容结果声明逐字备份，SHA256 `ed58f49343f075bc75ba44b1428c07cde3845d9b18766e02d7f8045e852e9ea7`。
- 两个备份均与前一成功部署 `1795d70ef958cf2e9ed55594867d718f569c2dfa` 的 Git 对象逐字相等；发布前线上 988 工具和 UI 另有完整匿名快照。
- 反向补丁 `git apply --reverse --check` 通过，仅作本机检查，未实际回滚。

如需回滚，在最新主线以反向提交撤销本次目录提交，或恢复这两个备份后提交并走既有蓝绿发布；保留先前共享指引消费支持和内置目录选择。不要 reset/强推主线，不依赖旧容器一直保留。回滚后应核对旧 988 工具与备份协议快照，并更新/重扫同一 OpenAI 草稿，恢复旧测试用例名称。网关回滚不会自动回滚 OpenAI 保存的元数据，也不会撤销已执行任务。本轮没有数据库、OAuth 或账务迁移。

## 参数与能力边界

冻结目录规范化对象摘要仍为 `71a21def2ffb9e00dcaa9be3905e7281311d217ab175622dbeb599eb80495d2a`，没有从当前契约重新生成并夹带新能力。

- 984 编译工具：982 固定执行绑定、2 任务/结果读取；运行期加 2 发现工具，共 986。
- 仅移除已批准的 TikTok 游客设备注册和 Bilibili 广告主人群包列表，结果读取 reference 同步 893→891。
- 其余有效输入/输出约束、默认值、权限、schemaHash、执行绑定与模式不变。SDK 默认增加的 idempotentHint=false 单独归一化比较，不把存储 JSON 与协议默认值差异当作权限变化。
- 146 个技术名迁移及展示修订均来自此前冻结候选，不增加旧名别名或扩大工具集合；OpenAI 已通过本轮扫描获取新名称。
- `result_schema.json` 仅去除 data 的描述注解，供两个匿名发现工具输出与同一候选对齐，没有更改有效约束或执行逻辑。
- 原 REST、本地三工具、生成参数处理、价格/计费、任务归属、OAuth 与 UI HTML 不变。

验证：完整 MCP race 回归通过；显式指定新目录的真实 Go SDK 测试列出 986 工具。插件 `npm run verify` 通过 66 主测试和 16 Harness 测试。首次沙箱运行仅因禁止监听 127.0.0.1 失败，获准回环后完整重跑通过；未为此修改代码。

CLI 状态查询曾出现网络 EOF/超时，匿名大响应读取曾超时，未重复触发部署。生产最终复验改用 Ego 浏览器匿名同源请求完成全部 10 页和 UI 读取；部署工作流成功状态及精确上线日志另行确认。没有业务 tools/call 或付费测试。

## 草稿更新

先下载 `draft-before.zip`，从原包复制生成更新包，仅将图片案例 tools_triggered 的旧模型技术名替换为 `beatapi_generate_images_nano_banana_2_890739a2`。其他 manifest 值及所有其他文件保持不变，保留演示录像、主体、国家/地区、声明值、Skill、MCP 配置和图标；所有案例工具名在新目录中存在。

更新操作为同一插件的 Reupload draft，不创建新插件，不重连账户，不读取安全字段中的审核员凭证，不代勾选法律声明。按门户流程重传会重置 attestations，后续由有权开发者确认。

第一次下载读回命中了旧草稿缓存，仍显示旧工具名，未据此宣称保存成功；刷新并关闭该页网络缓存后的 `draft-after-fresh.zip`，其 manifest 与更新包深度相等。保留第一次下载作为缓存差异证据，而不是有效新包。

## 正式扫描

只点击一次 Rescan。新鲜终态：

- attempt：`01a1bf5e-616c-7ed8-9bb4-baf357e2855a`。
- scan：`asdk_app_6aed1b32cb0c81919339954cee14a350~AppsSDKContinuousScan_6645d12e3df881919057407f6b252a02`。
- 开始 16:15:57，结束 16:17:59 北京时间。
- 986 工具与共享指引全部 complete，problem=null、activeRun=null、allToolsPass=null。
- 门户所有工具 action_name/title/description/input/output Schema 与冻结候选相等，两项移除工具不再出现。
- 315 条为通用“新工具定义仍需进一步审核”提示；14 条具体反馈为 11 项名称不清、1 项 YouTube 搜索说明不清、2 项发现工具被认为可执行未单独暴露操作。完整名单与原文见 `scan-comparison.json`，不把通用提示或这些具体反馈隐藏为“通过”。

发现工具两项判断需结合其仅检索/检查元数据的真实行为进一步核实；本轮不为消除标签擅自改权限或删能力。当前正式结果与此前独立诊断零具体反馈不同，以本轮正式草稿结果为准。

最终 scan 数据来自刷新后页面自身 appContinuousReview 查询缓存，仅提取该 app 的扫描数据，没有导出认证上下文。下载诊断按钮仍禁用，未绕过。完整目录和共享指引扫描已完成这一结论由本轮 attempt 的无错误终态支持，不是只看工具行显示 complete。

下一步先核实这 14 条具体反馈，再决定局部修订或整理误判依据；本轮不继续修改冻结目录，也不提交审核。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
