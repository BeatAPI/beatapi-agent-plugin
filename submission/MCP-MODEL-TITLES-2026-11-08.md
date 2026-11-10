# 文本模型标题核实与完整扫描

> 2026-11-08。仅本地展示修订、临时独立诊断 Worker 和既有独立草稿的一轮完整重扫；不改正式 `/mcp/openai`、正式草稿、网关、DNS、OAuth 或计费。不提交审核/申诉、不发布、不提交/推送 Git，不调用付费业务工具。

## 七轮历史对照

上一轮标记的 16 项为 Claude 7 项、DeepSeek 4 项、Gemini 5 项。逐项核对七轮门户实际定义：技术名、可读标题、说明、完整输入和输出 Schema **全部精确相同**，但判定如下。

| 完成时间 UTC | 16 项中的具体名称反馈数量 |
| --- | --- |
| 10:50:14 | 0 |
| 10:56:41 | 0 |
| 11:05:48 | 0 |
| 11:13:42 | 16 |
| 12:56:39 | 0 |
| 13:27:14 | 0 |
| 13:40:56 | 16 |

`history.json` 保存每项每轮的 scan ID、终态、原始具体理由和定义摘要，脚本先断言定义相等再生成材料。这证明存在**局部定义不变、判定变化**的现象，但七轮完整目录并不完全相同，因此不是全目录 A/A，不能断言 OpenAI 扫描器必错、变化的内部原因或模型一定等同某厂商产品。

## 可独立确认的展示问题

技术名已有 `beatapi_generate_text_<id>_<hash>`，说明也明确文本生成，不存在本轮发现的执行身份错误。但默认可读标题只是模型 ID，没有表达动作。[官方工具契约文档](https://developers.openai.com/plugins/plan/tools) 区分稳定的动作标识和简明可读的动作标题；[元数据指南](https://developers.openai.com/plugins/guides/optimize-metadata) 要求有步骤地调整元数据并记录复验。不能把历史波动当作不改善标题的理由，也不能把标题改善当作已证实的扫描唯一根因。

本地修复沿用 `scripts/remote-presentation.mjs` 的类别与专用展示词典：

- `text` 类别默认标题为 `Generate Text with <原契约标题>`，保留完整字面模型 ID，不推测未知缩写、厂商身份或性能。
- 已核实的两个 High-Cache 专用标题优先，保持原样；数据、图像、视频等其他类别不受此规则影响。
- 技术名仍从原契约标题与 reference 摘要生成，说明也继续使用原契约模型标识，不把新标题再拼入说明产生重复动作。
- 不维护 16 项扫描反馈名单、不增加模型专用执行分支、不改变参数规则；同类缺陷由同一规则解决。

这条通用规则使 **43 个**文本模型标题更新：本轮关注 16 项，以及相同缺陷的另外 27 项。不是删掉未标记模型或替换路由。含 `free` 的标识仍仅作为原字面 ID 保留，没有增加免费、官方或可用性承诺。

## 无损性与回归

- 冻结目录保留完整 **988 工具**，技术名零变化；只更新 43 个顶层 title，其他 945 个描述符完整相等。
- 所有非 title 字段逐项精确相等，包括 description、输入/输出 Schema 的说明/默认值/条件/扩展约束、权限、annotations、固定 reference/schemaHash、UI 绑定。目录 instructions、resources、contents 均精确相等。
- 新测试先复现缺少动作的标题，再验证任意文本模型 ID 的通用生成、原说明不重复、新旧固定调度身份一致、刷新幂等和其他类别不受影响；既有 High-Cache 覆盖也通过。
- 完整 `npm run verify` 通过：61 个主测试、16 个 Harness 测试；独立 Worker 5 项回归、CF dry-run、`git diff --check` 通过。首次受限环境的本机 mock 监听触发 EPERM，允许本机端口后重新完整运行通过，没有为通过测试修改运行行为。
- 候选 SHA-256：`5512e34291d39dc826477ab00e712cc0a2ad544724e91b0e52fb55904f31b2b1`。

## 独立扫描结果

15:19:03 UTC，**988/988 complete**，共享 instructions complete，problem 和 active_run 均为空，没有 unknown。门户全部 action_name/title/description/input_json_schema/output_json_schema 与冻结候选精确一致，确认实际导入了新动作标题，而不是沿用旧扫描。

- 本轮关注的 **16 项名称具体反馈全部消失**。
- 本轮修改标题的 **43 项均无具体反馈**；两个既有 High-Cache 标题仍无具体反馈。
- 另外有 **1 项**具体反馈：`beatapi_data_douyin_web_handler_shorten_url_78532ede50`，原说明为“生成短链接.”，理由为 `This tool's description appears missing, blank, or unclear.`，decision 为 `needs_investigation`。本轮没有改这个描述符，尚未核实其实际接口语义，不把它认定为本次修改引入的回归，也不在扫描后继续改候选。
- 还有 **887 条**通用 `This tool update needs further review before it can go live.`。它们未提供逐项细节，不能冒充已解决、已批准或 887 个已确定代码错误。

由于历史判定有波动，本轮不声称标题修复已证明消除扫描器内部根因；可以确认的是标题独立满足更明确的动作表达，本轮完整新扫描未再标记这 16 项。扫描完成和具体反馈消失都不等于审核批准；既有设备注册能力与公开范围声明的冲突仍须正式送审前独立决策。

### 标识与运行证据

- 独立草稿：`plugin_asdk_app_6af04252daf48191b4656176b44669c1`，Private metadata diagnostic，未提交、未发布。
- scan：`asdk_app_6af04252daf48191b4656176b44669c1~AppsSDKContinuousScan_3b9cdb92f018819184e1f79af9da56d0`。
- attempt：`01a1bbba-aec8-7f13-b3dc-fa544f9025a6`。
- 状态查询 request ID：`req_900818d6b9eb4b0b8644060ce1c49557`，不是不可见的内部审查请求 ID。
- Worker 版本：`51fd40d8-4645-44bb-b7df-f045c90f8845`。只临时挂载 `/mcp/scan-controls/*`，ACTIVE_CONTROL 为 full-ui，所有客户端得到同一完整候选；拒绝全部业务执行，没有网关执行凭证或转发路径。
- 匿名预检 10 页 988 工具、共享 instructions 和原 UI 与冻结快照精确相等。该版本白名单日志 29 条，包括 20 次 tools/list 和 2 次 resources/read 均 200；另有一条 400 以及预检 GET 的 406，扫描仍完成，未修改协议以伪造成功。

## 清理与影响

15:21:11 UTC 精确删除专用路由 `97fd9e61faf9406e8a32dbc2c058ec3b`，保留原域名验证路由。15:21:35 匿名复验正式 initialize 200、域名验证 200、诊断入口 404；随后结束本轮 Ego 任务并关闭本轮临时页面，没有操作其他用户窗口。

本轮只改插件本地展示规则、测试和相应文档，以及临时诊断快照/截止时间。没有编辑网关源码或部署正式端点，网关已有的五个未提交文件保留原状。全部参数和收费行为不变，没有生成新的正式 ZIP 或更新正式草稿。临时部署已经撤下路由，本地候选不代表正式环境已上线。

建议下一步只核实剩余短链接工具的真实语义，再判断是否存在说明缺陷；通用 further-review 和独立范围问题需分别处理，不能靠删能力、改参数或反复更换技术名消除标记。

证据目录：`submission/artifacts/mcp-model-titles-20261108/`。旧材料原样保存，不重生成版本绑定的旧审计脚本或覆盖历史结果。

后续记录：[抖音短链接用途核实与完整扫描](./MCP-SHORT-LINK-2026-11-08.md)。本报告保留 15:19 这一轮的历史结果，不代表后续反馈状态。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
