# HC 与 X 趋势修订及完整扫描

> 2026-11-08。仅本地展示修订和独立诊断草稿重扫；正式 `/mcp/openai`、正式草稿、网关、DNS、OAuth、计费均未修改。未提交审核/申诉、未发布、未提交/推送 Git，未调用付费模型或数据工具。

## 核实与实现

两个 HC ID 在 BeatAPI 的[第一方模型文档](https://docs.beatapi.io/api-reference/text-api/deepseek-responses)及[能力 FAQ](https://docs.beatapi.io/faq/models-capabilities)中明确指 **high-cache（高缓存）** 路线，用于重复 prompt 前缀的文本请求；不是从缩写猜成高并发或更长上下文。本机 Fern 文档也有相同定义。这里只核实路线名称和已发布用途，没有测量实际缓存命中、性能或计费，不写入命中率、免费或更低价格等承诺。

| 固定引用 | 新可读标题 | 技术工具名 |
| --- | --- | --- |
| `model:deepseek-v4.1-flash-hc` | Generate Text with DeepSeek V4.1 Flash (High-Cache) | 原样保留 |
| `model:deepseek-v4-pro-0813-hc` | Generate Text with DeepSeek V4 Pro 0813 (High-Cache) | 原样保留 |
| `data:twitter.web.fetch_trending` | X Trending Topics by Country | 原样保留 |

X 趋势的固定契约及原始文档确认：按 `country` 获取趋势，默认 `UnitedStates`。本地说明明确国家选择和单次查询，不误称关键词搜索、历史趋势分析或持续监控；未增加 country 枚举或改变默认值，没有捏造实际响应字段/统计量/实时性。原始数据来源只存于忽略的 `sources.json`，不进入公开描述或插件包。

展示沿用现有固定 reference 语义词典。模型技术名现在明确从**原契约标题**生成，而不是从可修订的展示 title 生成；reference 摘要算法不变。这解决“解释可读标题却意外更换工具名”的通用耦合，不引入 HC 专用执行分支或第二套参数配置。两个模型没有增加 cache-control、并发或其他输入。

## 保真与本地回归

- 候选完整保留 988 工具，技术名称零变化；仅上述三项的 title/description 更新，另外 985 个完整描述符精确相等。
- 所有输入/输出 Schema（包括说明、默认值、条件和扩展规则）、OAuth scopes、风险标记、固定 reference/schemaHash、共享 instructions、原 UI 内容均逐项精确相等。
- 新测试先复现标题/用途缺失，再验证已核实语义、技术名不变、country 默认值/接受范围及调度绑定。
- `npm run verify` 通过：58 个主测试、16 个 Harness 测试。独立 Worker 5 项回归通过，CF dry-run 通过后才部署。
- 候选 SHA-256：`34010ecfd15518a495b7a6b079618103421b539594425bbc9083c4290d291df1`。

## 完整独立扫描结果

13:27:14 UTC，**988/988 complete**，共享 instructions complete，`problem` 和 `active_run` 均为空，没有 `unknown`。

| 本轮关注项 | 具体名称/说明反馈 | 通用 further-review |
| --- | --- | --- |
| DeepSeek V4.1 Flash High-Cache | 无 | 有 |
| DeepSeek V4 Pro 0813 High-Cache | 无 | 有 |
| X 国家趋势 | 无 | 有 |

全部 988 项门户 `action_name/title/description/input_json_schema/output_json_schema` 与本轮候选精确一致，门户读取到的 HC 可读标题已展开，不是拿旧描述符冒充新修复。技术名仍是原 `_hc_...` 名称。这支持优先明确可读标题，而不是反复更换技术身份，但不能据一次复验断言扫描器内部一定使用哪个字段。

### 仍需处理的反馈

本轮另外出现 3 个具体反馈，完整结果保存在 `comparison.json`：

| 工具 | 当前说明 | 反馈 |
| --- | --- | --- |
| `beatapi_data_bilibili_huahuo_popular_up_x_huo_ba69349afe` | X火种草榜. | 名称不清 |
| `beatapi_data_bilibili_huahuo_x_huo_date_options_339021477c` | X火榜可选期数. | 名称不清 |
| `beatapi_douyin_get_creator_linked_user_structure` | creator-linked user structure，输入 kolId | 说明不清 |

还有 819 条通用 further-review 提示。没有把这些当作已解决，也未在扫描中途改其他工具。设备注册能力与公开范围声明的既有冲突仍未通过本轮扫描自动解决；具体反馈消失和检查 complete 都不等于公开审核批准。

### 标识与运行证据

- 独立草稿：`plugin_asdk_app_6af04252daf48191b4656176b44669c1`，Private metadata diagnostic，未提交、未发布。
- scan：`asdk_app_6af04252daf48191b4656176b44669c1~AppsSDKContinuousScan_f7d81888d6748191bccc468efe283ff3`。
- attempt：`01a1bb53-3496-7dd7-a119-164178aafbcc`。
- 状态查询 request ID：`req_ee7850e6fa3449e9af21ab1debf8ff80`，不是不可见的内部审查请求 ID。
- Worker 版本：`496c27df-d709-450f-96aa-f8ba623801a8`，仅 `/mcp/scan-controls/*`；所有业务调用保持拒绝，不转发执行。
- 匿名 10 页预检及原 UI 读取全部与冻结快照相等。该版本日志中 20 次 tools/list（预检及扫描各 10 页）、2 次 resources/read 均为 200；另有 1 次非法请求 400，扫描仍完成，未将它改成假成功。

## 清理与后续

13:28:09 UTC 精确删除诊断路由 `4bdd91913f234c4a98c0c08bea5b2e20`，原域名验证路由保留。13:28:31 匿名复验正式 initialize 200、域名验证 200、诊断入口 404。结束本轮浏览器任务并关闭本轮临时标签页，未操作其他用户窗口。

本轮未改网关源码、模型参数、账户或余额。正式环境尚未上线这些本地展示修订。后续可针对两个 Bilibili 专有榜单的可读名称和 Douyin 用户结构说明继续核实，不应为追逐每轮反馈而删工具、放宽约束或宣称整体已可送审。

证据目录：`submission/artifacts/mcp-hc-trends-20261108/`。旧扫描和旧候选保持原样，不把历史材料重新标成当前状态。

后续记录：[创作者榜单与连接用户数据核实及完整扫描](./MCP-CREATOR-REPORTS-2026-11-08.md)。本报告仍保留 13:27 这一轮的历史结果，不代表后续反馈状态。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
