# 人群包与指数有效日期核实及完整扫描

> 2026-11-09，以下时间为北京时间（UTC+8），原始机器记录使用 UTC。仅本地展示修订、临时独立诊断 Worker 和既有独立草稿的一次完整重扫；不改正式 `/mcp/openai`、正式草稿、网关、DNS、OAuth 或计费。不提交审核/申诉、不发布、不提交/推送 Git，不调用付费业务工具。

## 实际含义与边界

### Bilibili 人群包列表

固定引用 `data:bilibili.huahuo.dmp_pkg_list` 的原名称仅为内部标识，说明只有“人群包列表”，缺少用途和账户上下文。原始文档明确：获取当前广告主可选的自定义人群包，供受众匹配筛选使用；无输入。文档描述包 ID、名称、标签和可用匹配指标，选中包 ID 填入创作者搜索的 dmp_group_id。本地固定创作者搜索契约也存在该字段，接受 integer/string/null，本轮未修改。

因此它不是公开用户名单，不能把人群包元数据推导成个人成员或联系方式，也不能称为创建人群包或投放广告。更不能因本工具没有账号参数，就声称所有包公开、无账户边界，或默认来自当前 BeatAPI 用户自己的 Bilibili 账号。

本轮没有访问运行侧广告主会话或执行真实查询，**实际采用哪个广告主上下文、资产归属和委托授权均未验证**。这不是已证实的越权漏洞，但正式发布前必须独立取得证据；扫描未标记该项也不能代替授权验收。保留全部能力要求下，本轮没有隐藏或删除工具、增加账号输入、放宽权限或修改后端。

### 抖音有效日期

固定引用 `data:douyin.index.fetch_all_valid_date` 的原说明“获取所有有效日期”缺少所属数据源和“最新”的语义。原始文档确认它查询抖音指数各类数据最新可用的日/周/月日期，包含关键词、品牌、话题等维度；无输入。不是完整日历、视频发布日期列表，也不是某个关键词的可查询起止范围，后者是另一项接口用途。

两项文档均未定义真实业务响应 Schema，示例为 data:null。本轮没有执行收费查询，不承诺具体字段路径、日期格式/时区、当下最新日期、包内成员或指标算法。原始来源地址与详细证据仅放在被忽略的内部 sources.json；供应方身份/地址不进入公开插件元数据或包。

## 本地实现与回归

沿用现有固定 reference 展示词典，不增加执行分支或第二套参数规则：

| 引用 | 新可读标题 | 用途说明重点 |
| --- | --- | --- |
| `data:bilibili.huahuo.dmp_pkg_list` | List Bilibili Custom Audience Packages | 明确广告主上下文、无账号选择器、dmp_group_id 衔接及不推导个人成员 |
| `data:douyin.index.fetch_all_valid_date` | Get Douyin Index Latest Available Dates | 明确指数最新日/周/月可用日期与不适用场景 |

- 完整保留 **988 工具**，仅两项 title/description 改变，技术名零变化，其他 **986 个完整描述符精确相等**。
- 全部输入/输出 Schema（含说明、默认值、条件和扩展约束）、scopes、annotations、固定 reference/schemaHash、UI 元数据精确相等；共享 instructions、resources、contents 不变。
- 新回归先复现缺少用途/上下文，再验证原固定技术名与调度引用、空输入对象接受、伪造账号/日期参数仍拒绝、不虚构公开性或日期格式。没有为解释文案新增参数。
- `npm run verify` 通过：63 个主测试、16 个 Harness 测试；独立 Worker 5 项回归、CF dry-run 和 `git diff --check` 通过。
- 候选 SHA-256：`4eeb7a97038cd41dcab28fe87bf3cdaccc4f6cf4bd64e4deda784d53c51e16ac`。

## 完整独立扫描

09:21:42，**988/988 complete**，共享 instructions complete，problem 和 active_run 均为空，没有 unknown。全部门户 action_name/title/description/input_json_schema/output_json_schema 与冻结候选精确相等，确认扫描导入本轮新说明。

| 本轮目标 | 具体名称/说明反馈 | 通用 further-review |
| --- | --- | --- |
| Bilibili 自定义人群包 | 无 | 无 |
| 抖音指数最新可用日期 | 无 | 无 |

本轮另有一项未改动工具的具体反馈：

- 技术名：`beatapi_data_instagram_fetch_search_ceb898a205`。
- 标题：`instagram.fetch_search`；说明：`搜索用户.`。
- 理由：`This tool's description appears to claim capabilities that do not match its behavior.`，decision=fail；未提供具体 evidence 或 field。

另有 **836 条**通用 `This tool update needs further review before it can go live.`。它们不是 836 个已证实代码缺陷，也不是审核批准。本轮没有继续改变 Instagram 工具或通过删能力/放宽约束追逐标记。历史已出现局部定义不变而判定变化的现象，因此不能把一次反馈消失解释成永久获准，也不能将新反馈直接归因为本轮改坏了目录。

### 标识与日志

- 独立草稿：`plugin_asdk_app_6af04252daf48191b4656176b44669c1`，Private metadata diagnostic，未提交、未发布。
- scan：`asdk_app_6af04252daf48191b4656176b44669c1~AppsSDKContinuousScan_c6adc3c6d3c88191ab424c56258ace08`。
- attempt：`01a1bde2-2848-7e2a-bb05-56899bf6b161`。
- 状态查询 request ID：`req_11a42eae77494b4f97cb6f8e4aba7053`，不是不可见的内部审查请求 ID。
- Worker 版本：`337e2607-069d-4d2b-905a-c7b653224bc0`，只临时挂载 `/mcp/scan-controls/*`，full-ui 对所有客户端提供同一完整候选，拒绝所有业务执行，没有网关执行凭证。
- 匿名预检 10 页完整目录、共享指引和原 UI 与快照精确相等。该版本白名单日志 29 条，20 次 tools/list、2 次 resources/read 均 200；另有一条 400 和预检 GET 的 406，扫描仍完成，没有伪造协议成功。

## 清理与影响

09:23:19 精确删除专用路由 `dd11034e1b594c5b951f8028b5b3b640`，保留原域名验证路由。09:23:37 匿名复验正式 initialize 200、域名验证 200、诊断入口 404；随后结束本轮 Ego 任务并关闭本轮临时页面，没有操作其他用户窗口。

本轮只改插件本地展示词典、回归、相关文档和临时诊断快照/截止时间。网关原有五个未提交文件保持原状，没有编辑或部署正式后端，没有更新正式草稿/正式 ZIP、改账户或余额，未提交审核。

后续可独立核实 Instagram 搜索的真实操作和输入上下文，再判断说明问题；人群包资产授权归属、既有设备注册与公开范围冲突，以及通用 further-review 均未由本轮扫描自动解决，不应直接进入正式送审。

证据目录：`submission/artifacts/mcp-audience-dates-20261109/`。旧候选和历史扫描保持原样，不重生成旧的版本绑定审计证据。

后续记录：[Instagram 搜索修订与正式上线门槛](./MCP-INSTAGRAM-SCOPE-2026-11-09.md)。本报告保留上一轮历史结果，不代表后续反馈状态。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
