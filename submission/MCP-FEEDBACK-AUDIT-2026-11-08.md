# 剩余 21 项反馈核实

> 本轮仅本地修改与离线核实。没有修改正式端点、网关源码/配置、DNS、OAuth 或计费；没有部署独立诊断服务、更新门户草稿、重扫、调用付费业务工具、提交审核、发起申诉或提交/推送 Git。上轮已扫描快照保持原样。

## 结论

21 项全部逐项处理：3 个数据工具存在确定的展示缺陷，已本地修复；18 个文本模型名称有较强的上下文误判迹象，保留原名并整理复核依据。后者是“有证据的疑似误判”，不是代替 OpenAI 作出最终裁定。

完整候选仍为 988 工具。仅 3 项 title/description 更新、其中 1 项改名；另外 985 个完整描述符逐项相等。所有工具的输入/输出 Schema（含说明、默认值、条件及扩展约束）、权限、风险标记、reference/schemaHash 和原 UI/共享 instructions 完全不变。

## 确定问题与修复

| 稳定引用 | 核实结论 | 本地修复 | 剩余边界 |
| --- | --- | --- | --- |
| `data:tiktok.web.device_register` | 原“设备注册”未说明实际返回的游客设备 ID/Cookie；没有输入字段，不是注册普通用户账号 | 明确为游客设备注册及技术标识生成，不伪装成社媒内容研究；保留原工具名 | 另有公开范围一致性问题，见下文；并非误判 |
| `data:tiktok.web.fetch_live_im_fetch` | `fetch_live_im_fetch` 是含糊的实现名称；契约为房间号、可选用户 ID 和响应格式，文档描述弹幕参数获取 | 改名 `beatapi_tiktok_get_live_comment_parameters`，明确单次参数获取，不承诺持续监听、录屏或发评论 | 没有取得真实付费响应，不捏造具体连接字段，也不承诺历史消息 |
| `data:weibo.web_v2.fetch_all_groups` | 原“获取所有分组信息”未解释分组类型/用途，容易误解为用户私人分组 | 明确是可用时间轴分组元数据（ID、名称、container ID），供时间轴工具使用 | Schema 没有微博账号/凭证输入，不能声称是当前用户全部私人分组；未断言全部结果公开或各账号均可用 |

三个工具的文档、固定契约及现有端点映射已相互核对。数据来源的原始 URL/实现定位只保存在本机忽略的 `internal-sources.json`；没有写进工具说明或英文复核草稿，没有采集、生成或保存可用 Cookie。

### 设备注册的独立范围问题

当前编译器的精确排除表拒绝部分设备注册/游客凭证操作，却未列出 `data:tiktok.web.device_register`，历史完整快照仍含这项能力。它与项目声明的“公开调研/创作、不提供设备注册/凭证获取”范围存在真实冲突，不是名称扫描器误判。

遵照保留全部能力的要求，本轮没有增加排除项、关闭工具、隐藏输出、修改权限或规避扫描。补全真实用途不等于解决公开范围问题。后续正式送审前必须明确范围决策；这并不等于已认定其违反某一具体 OpenAI 条款。不能把本轮文案修复当作该能力已获准公开。

## 18 个名称复核候选

下列条目的名称、title、description、输入和输出 Schema，在四轮已完成扫描的门户定义中完全相同；完整工具描述符在去掉体积对照专用的无行为 padding 后也完全相同。均为同一固定 `model:<id>`、同步文本生成、接受文字/消息列表，并声明文本结果。

| 序号 | 固定模型 ID（不是独立验证的厂商身份声明） | 处理 |
| --- | --- | --- |
| 1 | `claude-fable-5-1` | 保留名称，整理复核依据 |
| 2 | `claude-haiku-4-5-20251001` | 同上 |
| 3 | `claude-haiku-5-5` | 同上 |
| 4 | `claude-opus-5` | 同上 |
| 5 | `claude-opus-5-5` | 同上 |
| 6 | `claude-sonnet-5` | 同上 |
| 7 | `claude-sonnet-5-5` | 同上 |
| 8 | `deepseek-v4.1-flash` | 同上 |
| 9 | `deepseek-v4.1-flash-free` | 保留字面路由标签，不作免费承诺 |
| 10 | `deepseek-v4.1-flash-hc` | 保留字面路由标签，不臆测 HC 含义 |
| 11 | `deepseek-v4-flash-0731` | 保留名称，整理复核依据 |
| 12 | `deepseek-v4-pro-0813` | 同上 |
| 13 | `deepseek-v4-pro-0813-hc` | 保留字面路由标签，不臆测 HC 含义 |
| 14 | `gemini-3.1-pro-preview` | 保留名称，整理复核依据 |
| 15 | `gemini-3.6-flash` | 同上 |
| 16 | `gemini-3.7-flash` | 同上 |
| 17 | `gemini-3.8-flash` | 同上 |
| 18 | `gemini-4-argon` | 同上 |

### 依据

1. 名称结构均为 `beatapi_generate_text_<model>_<stable-hash>`，明确表达领域/动作，并保留用户选择的具体模型 ID。八字符摘要用于稳定防重，不是执行引用，也不把未知缩写展开成能力承诺。
2. 输入契约接受 prompt/消息列表，可选 instructions、max_output_tokens、temperature；原生契约结果有 `text.result` 和 `output_text`。本地调度器固定绑定原 reference，不把选中的模型偷偷替换成其他模型。
3. 网关源码 `service/beatapi_capability_registry.go` 的 RegisterBeatTextModels、`service/beatapi_text_run.go` 的 BuildBeatTextRunRequest/RewriteBeatTextRunResponse，以及 `service/beatmcp/dispatch.go` 的固定绑定支持这条语义链。本轮只阅读，未编辑或执行真实上游请求。
4. 同一批 18 项在 10:50:14、10:56:41、11:05:48 三轮 complete 中均没有名称不清反馈，在 11:13:42 才整批出现。每项的扫描/attempt ID、原描述符 SHA-256 和参数 Schema 哈希都已保存，且由脚本强制核对，不只凭截图判断。
5. [OpenAI 元数据指南](https://developers.openai.com/plugins/guides/optimize-metadata) 强调领域与动作，[插件指南](https://developers.openai.com/plugins/plugin-guidelines) 要求名称可理解、准确，说明与行为相符。这支持保留动作明确、可追溯的名称并请求具体歧义依据，但官方同样不鼓励晦涩标识，不能把技术摘要的合理用途当作官方认可。

### 不能推导的结论

全目录的其他工具在部分轮次中发生变化，因此这不是完全相同全目录的 A/A 复验；只能证明局部元数据未变化、名称判定却变化。不能据此保证扫描器必错、模型一定真实可用/等同特定厂商产品，或插件已经通过审核。当前仅核实网关公开契约与本地执行接线，没有消耗余额做 18 个模型的真实生成测试。

## 验证与交付

- `node submission/mcp-scan-controls/audit-findings.mjs` 通过：21 项全部归类，988 工具逐项保真，18 个名称保持不变，唯一更名另列映射。脚本只写新证据目录，不覆盖旧扫描或 Worker 部署输入。
- 21 项的同输入调度结果与修订前完全相等；18 个文本工具的无效文本类型、零 token 上限仍拒绝。这里是离线参数/绑定测试，不是远程工具执行。
- 先写回归复现缺失用途，再修复展示词典。`npm run verify` 通过：56 个主测试、16 个 Harness 测试。
- 公开包测试增加精确文件白名单；私有来源、原始反馈和英文复核草稿不会随公开 ZIP 打包。三个展示描述也检查不包含私有数据来源名称/域名。
- 候选 JSON 对象 SHA-256：`095d28007ad026fba048ab68a1a0a9c51faf6b9fbb3dd6578a7efa73cf7859e5`；这是紧凑序列化对象摘要，不是缩进后的文件字节摘要。
- 本轮候选尚未部署或门户重扫，不能沿用旧快照的 complete 状态。原有“further review”反馈不属于本次 21 项名称/说明核实，不自动清除。

本机材料在 `submission/artifacts/mcp-feedback-audit-20261108/`：`dispositions.json` 提供完整逐项证据，`preservation.json` 是保真报告，`review-note-en.md` 是可供人工核对的英文说明草稿。后者不披露数据来源，但仍只是草稿，没有发起任何复核/申诉或审核请求。

## 后续独立重扫

本地核实后的候选已按用户后续授权独立重扫，结果见 `MCP-FEEDBACK-RESCAN-2026-11-08.md`：988 complete，三个修复项的具体反馈消失，18 个模型仅剩两个 HC 名称反馈，另新增一项 X 趋势说明反馈。此段更新后续状态，不改写本报告中的历史本地核实证据或旧扫描响应。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
