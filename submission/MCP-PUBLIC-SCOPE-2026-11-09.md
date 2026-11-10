# 公开范围调整与新目录

后续状态：用户另行授权后，冻结候选已在 cd3010a02 正式上线，同一草稿完成 986 工具扫描，仍有具体反馈，未提交审核。见 MCP-FORMAL-986-RELEASE-2026-11-09.md；下面保留本次准备阶段的原始边界与证据。

> 2026-11-09，时间为北京时间（UTC+8），原始机器记录为 UTC。用户明确确认“同意，仅调整公开送审目录”；原 API、本地工具及其他能力保留，暂不激活正式端点或提交审核。本轮仅本地修改、mock/SDK 回归和既有独立草稿复验，未调用收费业务。

## 核心实现

公开编译器已有的精确 reference 排除策略新增两项：

| 引用 | 公开目录处理 | 原 API/本地工具 |
| --- | --- | --- |
| `data:tiktok.web.device_register` | 排除游客设备注册/游客凭证能力 | 保留，未编辑其实现 |
| `data:bilibili.huahuo.dmp_pkg_list` | 广告主授权证据齐备前不公开人群包列表 | 保留，未编辑其实现 |

不是仅修改展示名称或 UI 隐藏。新编译工具和绑定不包含这两项；冻结描述符通过 `restrictRemoteTools` 复用同一排除表，删除对应工具和结果读取枚举中的两条引用。构建校验拒绝通过任务/结果枚举重新引入策略排除项，next 适配也不能把被移除引用转成可调用工具。

没有第二份运行策略名单、平台专用执行分支或网关新后端。已有网关发现逻辑按选定目录的绑定过滤 Search/Inspect；读取还会核验实际绑定、权限和归属，不因保留旧的其他枚举值而放开执行。本轮未修改该网关实现。

## 新候选与保真

- SDK 可见总数 **986**：982 个固定执行绑定、2 个任务/结果读取工具、2 个独立发现工具。
- 可激活的 v2 编译目录含 984 工具、982 绑定，网关另外提供 2 个发现工具；不能把两个计数混用。
- 对比最后一版 988 候选：正好移除获准的两项，保留的 **985 个完整描述符精确相等**；另外一个结果读取工具只在 reference 枚举中删除这两项，枚举从 893 变为 891。
- 其他 Schema、输入说明、默认值、条件/扩展约束、模型/工具技术名、scopes、annotations、绑定内容、共享 instructions 和原 UI 资源完全保留，不重建其他历史读取枚举。
- 全部 982 个保留绑定按 reference 与同源历史编译目录精确一致，包括模式、schemaHash 和状态读取支持，未因再编译引入其他新能力。

冻结文件：

- `submission/artifacts/mcp-public-scope-20261109/remote-catalog.json`：正式目录候选，**尚未上传/激活**。规范化 JSON 对象 SHA-256 为 `71a21def2ffb9e00dcaa9be3905e7281311d217ab175622dbeb599eb80495d2a`，不是缩进文件字节摘要。
- `candidate-snapshot.json`：独立诊断实际使用的 986 工具/原 UI 快照，文件 SHA-256 为 `d9a0935696b43950b5840372c39a63bd5f796a164ea926aad4aa703d6bf15ad9`。
- `approval.json`、`changes.json`、`preservation.json`：确认边界、逐项差异和保真断言。旧 988 候选/扫描保持原样，不改写为新目录结果。

## 回归与影响

新增测试先复现公开编译仍包含两项、读取枚举可重新引入两项的问题，再实施范围策略。覆盖编译排除、旧描述符投影幂等/不修改输入对象、拒绝移除工具直接调用和结果读取、next 无替代执行、保留工具继续调度，以及无关历史读取枚举不被重算。

- `npm run verify`：**66 个主测试、16 个 Harness 测试通过**，包括本地 stdio MCP 和发布包边界。
- 独立 Worker 5 项回归及 CF dry-run 通过。
- 使用新 `remote-catalog.json` 运行现有 `TestCompiledDeploymentCatalog`，本机真实 Go MCP SDK 经 TLS mock 分页列出 **986 工具**，未执行业务。
- 现有网关 `TestRemoteMCPAuthorizationAndDispatch` 和 `TestCatalogServerInstructions` 通过，检查发现注册表隔离、授权/调度、共享指引。测试使用临时 SQLite/mock 身份，不是生产用户或供应方验收。
- `git diff --check` 通过；修改的代码文件均不超过 800 行。

原 API、`mcp/` 本地实现、canonical Skill、Harness 与网关业务实现均未编辑。本地工具不依赖这套公开构建脚本；网关既有五个未提交文件保持原状。本轮没有提交/推送 Git，也没有因排除操作停用原 API、改用户账户或余额。

这不是全量数据权限审计。创作者搜索现有 dmp_group_id 等输入未改动，其他能力仍依赖原有服务授权和归属控制；人群包重新公开前仍需补授权证据，不能把目录移除解释为已经验证所有广告资产访问权限。

## 独立扫描结果

10:12:48，**986/986 complete**，共享 instructions complete 且 findings 为空，problem 与 active_run 均为空，没有 unknown。两项移除工具均不在本轮门户工具列表中；全部 986 项 action_name/title/description/input_json_schema/output_json_schema 与冻结候选精确相等。

本轮全目录**具体名称、说明或能力反馈为 0**，没有其他具体反馈。仍有 **891 条**通用 `This tool update needs further review before it can go live.`，all_tools_pass 为 null，因此不代表公开审核批准。该提示数量不宜当作代码质量分数；历史局部相同定义已有判定波动，本轮不为追逐提示再修改无明确依据的字段。

### 运行标识与日志

- 独立草稿：`plugin_asdk_app_6af04252daf48191b4656176b44669c1`，Private metadata diagnostic，未提交、未发布。
- scan：`asdk_app_6af04252daf48191b4656176b44669c1~AppsSDKContinuousScan_b8a6ccfeb010819188f81eec11b0e131`。
- attempt：`01a1be10-856f-79d8-a566-7f9e14f008cd`。
- 状态查询 request ID：`req_d5e1fa4188f1425481b202db17aa477f`，不是不可见的内部审查请求 ID。
- Worker 版本：`65120b39-3ff6-40f8-8df4-db55443c5f5a`，仅临时 `/mcp/scan-controls/*`，所有客户端得到同一 full-ui 候选，拒绝全部业务执行，不持有网关执行凭证。
- 匿名预检 10 页完整目录、共享指引和原 UI 与冻结快照精确相等。白名单日志 29 条，其中 20 次 tools/list、2 次 resources/read 均 200；另有一条 400 和预检 GET 的 406，扫描仍完成，没有伪造协议成功。

## 清理与正式环境边界

10:14:43 精确删除专用路由 `041d19f2afd1473788d975381211d2a7`，保留原域名验证路由。10:14:58 匿名复验正式 initialize 200、域名验证 200、诊断入口 404；随后结束本轮 Ego 任务并关闭本轮临时页，未操作其他用户窗口。

正式 `/mcp/openai`、正式草稿和正式 ZIP 没有更新；当前线上不因此自动采用 986 目录。本次授权仅落实公开范围与准备候选，不包含正式激活或审核提交。

下一步是**单独确认正式目录激活**：先只读核对当前网关选中内置目录还是管理员上传目录、共享指引支持和回滚目标，再激活冻结目录并匿名逐项核验；随后在原正式草稿重扫，再做真实用例复测与录屏。最终是否提交审核另行确认，不将独立草稿结果冒充正式草稿的存储快照。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
