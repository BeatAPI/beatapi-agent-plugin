# 抖音短链接用途核实与完整扫描

> 2026-11-08。仅本地展示修订和既有独立诊断草稿的一次完整重扫；不改正式 `/mcp/openai`、正式草稿、网关、DNS、OAuth 或计费。不提交审核/申诉、不发布、不提交/推送 Git，不调用收费业务工具。

## 核实与边界

固定引用 `data:douyin.web.handler_shorten_url` 的原说明只有“生成短链接”，没有说明输入用途、转换方向或与其他 URL 工具的区别。这是可以确认的描述缺陷，不是空响应或参数接线故障的证据。

原始接口文档标题为生成短链接，请求示例将已有的完整抖音视频页面 URL 放入 target_url。固定 BeatAPI 契约同样只要求字符串 target_url，同步执行，schema_hash 为 `f1e1a0a9575054bb`。这支持“请求生成抖音短链接”，不支持误写成“还原短链接”、获取视频详情或下载媒体。旧参数说明中的“待转换的短链接”不能作为相反转换方向的依据；本轮保留原 Schema 字段说明，通过工具用途明确方向，没有新增 URL 格式或域名校验。

文档业务响应示例仅为 data:null，没有定义真实结果字段、路径或类型。没有执行收费请求，因此不承诺某个 JSON 路径、短链接域名、有效期、唯一性、永久可用、追踪能力或所有页面类型均受支持。也不把外部链接生成请求称作无副作用的本地只读计算；原风险标记保持不变。

原始来源 URL、请求示例和未核实边界只保存在被忽略的内部 `sources.json`。第三方转载和自称真实的响应示例没有被用来虚构 BeatAPI 的输出保证，供应方身份/地址不进入公开插件描述或公开包。

## 本地修订

沿用 `scripts/remote-presentation.mjs` 的固定 reference 展示词典，不增加执行分支、转换代码或另一套参数规则。

- 可读标题：`Generate Douyin Short Link`。
- 说明明确 target_url 对应已有抖音页面，操作是链接缩短而非展开，不用于获取视频详情或下载；请求链接生成不等于发布内容或向其他用户发送链接。
- 技术名保持 `beatapi_data_douyin_web_handler_shorten_url_78532ede50`，执行仍绑定原引用，不更名、不替换工具或路由。

## 无损性与测试

- 候选仍是完整 **988 工具**，仅本工具 title/description 改变，另外 **987 个完整描述符精确相等**。
- 全部输入/输出 Schema（含原说明、默认值、条件和扩展约束）、scopes、annotations、固定 reference/schemaHash、UI 元数据精确相等；共享 instructions、resources 和 contents 均不变。
- 新回归先复现缺失说明，再验证生成方向、原参数名/固定调度、必填和类型拒绝，以及不擅自添加原 Schema 没有的非空/格式限制；不会实际发出生成请求。
- 完整 `npm run verify` 通过：62 个主测试、16 个 Harness 测试；独立 Worker 5 项回归、CF dry-run 和 `git diff --check` 通过。
- 候选 SHA-256：`99640d87af068e3422e254a02d59a3855fdd89520cd2006b3b4de36ad18f4264`。

## 独立完整扫描结果

15:33:09 UTC，**988/988 complete**，共享 instructions complete，problem 和 active_run 均为空，没有 unknown。全部门户 action_name/title/description/input_json_schema/output_json_schema 与冻结候选精确相等，确认本轮导入的是新说明。

短链接工具的具体名称/说明反馈已消失，仍有通用 further-review；本轮不把一次未标记解释为永久通过，历史扫描已观察到局部元数据不变但判定波动。

另外两个本轮没有改动的工具出现具体反馈：

| 技术工具名 | 当前说明 | 反馈 |
| --- | --- | --- |
| `beatapi_data_bilibili_huahuo_dmp_pkg_list_efa680b8da` | 人群包列表. | 名称不清，decision=fail |
| `beatapi_data_douyin_index_fetch_all_valid_date_d6262c8c8f` | 获取所有有效日期. | 说明不清，decision=fail |

此外有 **814 条**通用 `This tool update needs further review before it can go live.`，并未提供逐项细节。它们不是 814 个已证实的代码缺陷，也不等于已获审核批准。本轮没有继续改新反馈项来追逐扫描，完整原始理由见 comparison.json。

### 运行标识与日志

- 独立草稿：`plugin_asdk_app_6af04252daf48191b4656176b44669c1`，Private metadata diagnostic，未提交、未发布。
- scan：`asdk_app_6af04252daf48191b4656176b44669c1~AppsSDKContinuousScan_94220c60331481918acecf6c26152e5d`。
- attempt：`01a1bbc7-263b-79d4-b33d-87decce316da`。
- 状态查询 request ID：`req_b6cda340e6fd4031b09b6f4df0aa21a1`，不是不可见的内部审查请求 ID。
- Worker 版本：`6e1c7dae-6adb-4bdd-906d-62654e7af386`。仅临时 `/mcp/scan-controls/*`，full-ui 给所有客户端同一目录，拒绝全部业务执行，不访问网关账户。
- 匿名预检 10 页完整工具及原 UI/共享指引均与冻结快照相等。该版本白名单日志共 29 条，其中 20 次 tools/list、2 次 resources/read 均 200；另有一条 400 和预检 GET 的 406，扫描仍完成，没有改协议伪造成功。

## 清理与后续

15:34:24 UTC 精确删除专用路由 `36979f67aac2490da5f7ce71d0a73f91`，保留原域名验证路由。15:34:38 匿名复验正式 initialize 200、域名验证 200、诊断入口 404；随后结束本轮 Ego 任务并关闭本轮临时页，未操作其他用户窗口。

本轮只改本地展示词典、回归和对应文档；临时部署输入使用冻结候选，没有改正式服务。网关源码及已有五个未提交文件保持原状。没有生成新正式 ZIP、更新正式草稿、改变账号或余额，也没有正式送审。

下一步可分别核实人群包列表和有效日期的实际接口含义，确认公开数据范围和输入上下文后再改文案，不能只根据内部缩写推测用途。通用 further-review 和既有设备注册/公开范围冲突仍需独立处理，不由本次扫描自动解决。

证据目录：`submission/artifacts/mcp-short-link-20261108/`。旧候选和历史扫描原样保留。

后续记录：[人群包与指数有效日期核实及完整扫描](./MCP-AUDIENCE-DATES-2026-11-09.md)。本报告保留上一轮历史结果，不代表后续反馈状态。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
