# 创作者榜单与连接用户数据核实及完整扫描

> 2026-11-08。仅本地展示修订和独立诊断草稿重扫；不修改正式 `/mcp/openai`、正式草稿、网关、DNS、OAuth 或计费。不提交审核/申诉、不发布、不提交/推送 Git，不调用付费业务工具。

## 核实与修订

沿用现有固定 reference 展示词典，仅修正三个 title/description，不增加接口、执行分支或第二套参数规则。技术工具名不变。原始接口文档依据保存在被忽略的内部 `sources.json`，供应方身份和地址不进入公开插件元数据或插件包。

| 固定引用 | 修订后的可读标题 | 已核实用途 |
| --- | --- | --- |
| `data:bilibili.huahuo.popular_up_x_huo` | Get Bilibili Industry Creator Rankings | 指定行业、月度或季度的创作者榜单，不是商品目录或帖子搜索 |
| `data:bilibili.huahuo.x_huo_date_options` | List Bilibili Creator Ranking Periods | 已结束的榜单可选期数，不是另一张创作者榜单 |
| `data:douyin.xingtu.kol_link_struct_v1` | Get Douyin Creator Connected-User Data | 按星图创作者 kolId 查询既有连接用户数据，不是关联账号、关注或发送消息 |

Bilibili 榜单文档确认行业 ID、rank_date_type（1 月度、2 季度）、可选 YYYY-MM 的 rank_date 及从 1 开始的页码；省略日期选择最近已结束期数。期数接口返回从早到晚的 YYYY-MM 选择项，不含当前未结束期数。本地只补充交互语义，没有增加枚举、正则或其他参数限制，也不承诺未核实的排名公式、统计字段或实时性。

Douyin 文档仅能确认按星图 kolId 查询该创作者的既有连接用户数据；kolId 不是抖音用户名。文档未定义具体字段，通用响应示例为 data:null，因此**不能确认连接用户的精确定义、个体/聚合形态、人口属性或指标算法**。说明明确只使用实际返回字段，不凭内部方法名推导粉丝名单、画像或联系方式。本轮没有执行收费请求，所以不把文档核实描述成真实响应验收。

## 无损性与测试

- 固定完整 988 工具；仅三项展示修订，技术名零变化，另外 985 项描述符精确相等。
- 全部输入/输出 Schema（含说明、默认值、条件和扩展约束）、scopes、annotations、reference/schemaHash、共享 instructions、原 UI 内容精确相等。
- 新回归先复现用途/说明缺失，再验证榜单与期数用途区分、kolId 身份边界、未公开字段不虚构及原调度身份/参数接受范围不变。
- `npm run verify`：60 个主测试和 16 个 Harness 测试通过；独立 Worker 5 项回归及 CF dry-run 通过；`git diff --check` 通过。
- 候选 SHA-256：`16982fcda2b22999634b5c4b4355da969db6b53e423d7e14e4d21ac45750bc55`。

## 独立完整扫描

13:40:56 UTC，**988/988 complete**，共享 instructions complete，problem 和 active_run 均为空，没有 unknown。全部门户 action_name/title/description/input_json_schema/output_json_schema 与固定候选精确一致，确认扫描读到了本轮修订。

| 本轮目标 | 具体名称/说明反馈 | 通用 further-review |
| --- | --- | --- |
| Bilibili 行业创作者榜单 | 无 | 有 |
| Bilibili 榜单期数 | 无 | 无 |
| Douyin 创作者连接用户数据 | 无 | 有 |

另外仍有 **16 项模型工具名称不清**反馈和 **902 条**通用 further-review。16 项涉及 Claude 7 项、DeepSeek 4 项、Gemini 5 项；完整工具名、原描述及原始理由保存在 comparison.json。这些模型描述符本轮未改变，不能把它们断言为本轮修订引入的回归，也不能据上一轮未标记就断言已永久解决。两个 HC 和 X 国家趋势本轮没有具体反馈。通用提示未提供足以逐项修复的解释，不将其冒充已通过或已证实的代码缺陷。

扫描完成不等于正式审核批准；设备注册能力与公开范围声明的既有冲突也没有被本轮自动解决。本轮只完成已授权三项的核实、修订和一次完整复验，没有继续改其他工具来追逐反馈。

### 标识与日志

- 独立草稿：`plugin_asdk_app_6af04252daf48191b4656176b44669c1`，Private metadata diagnostic，未提交、未发布。
- scan：`asdk_app_6af04252daf48191b4656176b44669c1~AppsSDKContinuousScan_e808027d3ce08191966da1ec2eb5a6a5`。
- attempt：`01a1bb5f-7f4d-75ed-9b96-7229f3e6666d`。
- 状态查询 request ID：`req_ca4050e1fd0143d4bbe58ef5dc6eeb47`，不是不可见的内部审查请求 ID。
- Worker 版本：`b2534c68-de2d-4661-afb9-f79cfc9b4dc9`，仅专用 `/mcp/scan-controls/*`，拒绝所有业务执行，不转发网关。
- 匿名预检 10 页目录及原 UI 与快照精确相等。该版本脱敏日志共 28 条：20 次 tools/list、2 次 resources/read、1 次 resources/list 均 200；另有 1 次非法请求 400，扫描仍完成，不把协议错误改成假成功。

## 清理与影响

13:41:55 UTC 精确删除本次诊断路由 `92cce9903260415ab7d01060150c5efe`，保留原域名验证路由。13:42:10 匿名复验正式 initialize 200、域名验证 200、诊断入口 404；随后结束本轮 Ego 任务并关闭本轮临时页，没有操作其他用户窗口。

本轮没有改网关源码、执行参数、账户或余额，正式端点和正式草稿均未更新。这些展示修订仍只在本地和本次已撤路由的独立候选中。下一步宜将剩余模型名称反馈与历轮固定描述符逐项对照，先区分稳定问题和扫描波动，不删工具、不放宽约束、不直接送审。

证据目录：`submission/artifacts/mcp-creator-reports-20261108/`。原候选、旧扫描与历史报告保持原样。

后续记录：[文本模型标题核实与完整扫描](./MCP-MODEL-TITLES-2026-11-08.md)。本报告保留 13:40 这一轮的历史结果，不代表后续反馈状态。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
