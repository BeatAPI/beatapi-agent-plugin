# Instagram 搜索修订与正式上线门槛

> 2026-11-09，以下时间为北京时间（UTC+8），机器记录为 UTC。仅本地修订、离线范围检查及既有独立草稿的一次完整重扫；正式端点、正式草稿、网关、DNS、OAuth、计费不变。不提交审核/申诉、不发布、不提交/推送 Git，不调用收费业务工具或读取真实业务凭证。

## Instagram 实际用途

固定引用 `data:instagram.fetch_search` 并非仅搜索用户。原契约的 query 必填、select 可选；原始文档明确 users/hashtags/places 三类筛选，省略 select 返回混合类型。原说明“搜索用户.”没有说明省略行为或其他实体类型，是可以确认的用途不完整。扫描未提供 field/evidence，因此不臆测其内部为何以“描述与行为不符”分类。

本地可读标题改为 `Search Instagram Users, Hashtags and Places`，说明明确三类实体、select 筛选/省略，以及不用于帖子或 Reel 搜索、私信访问或关注操作。技术名仍为 `beatapi_data_instagram_fetch_search_ceb898a205`，不换路由，不新增 select 枚举或默认值，也不声称实际返回条数、结果完整性或私有账号访问能力。

除了文档与固定契约，已离线读取网关的现有映射并执行纯请求构造：query 原样编码，select 省略时真正不发送，不是发送字符串 undefined；users/hashtags/places 均原样发送。禁止网络的 mock 中没有触发业务请求。文档通用响应为 data:null，未取得收费真实响应，不能承诺字段嵌套。

原始来源仅保存于忽略的 sources.json，不在公开描述或插件包暴露供应方身份/地址。网关源码只读，未因说明修订改动请求逻辑。

## 完整保真与回归

- 固定 **988 工具**，仅 Instagram 一项 title/description 改变，技术名零变化，其余 **987 个完整描述符精确相等**。
- 全部输入/输出 Schema（说明、默认值、条件和扩展约束）、权限、annotations、固定引用/schemaHash、原 UI 元数据、共享 instructions/resources/contents 精确相等。
- 新测试先复现用途缺失，再验证三个 selector 与省略行为、原输入原样调度、未来字符串值仍按原 Schema 接受，缺少 query 仍拒绝；没有暗中收紧参数。
- `npm run verify` 通过：64 个主测试、16 个 Harness 测试；独立 Worker 5 项回归、CF dry-run 和 `git diff --check` 通过。
- 候选 SHA-256：`0c551e2444e67c7c0a2d554219707fd48b88486d641e7628567cde381ad3bdce`。

## 独立扫描终态

09:46:29，**988/988 complete**，共享 instructions complete 且无 findings，problem 和 active_run 均为空，没有 unknown。全部门户 action_name/title/description/input_json_schema/output_json_schema 与冻结候选精确相等。

Instagram 本轮无具体反馈，仍有通用 further-review。**整个目录本轮具体名称/说明/能力反馈为 0**，没有新增其他具体反馈；仍有 **793 条**通用 `This tool update needs further review before it can go live.`，all_tools_pass 为 null，不能称为整体审核通过。具体反馈计数是将该原样通用理由单独分类后的结果，不是丢弃任何其他理由。

这支持停止无依据地追逐名称变化，先处理实际公开范围和授权门槛。历史判定存在局部定义不变而反馈变化，单次零具体反馈不保证永久获准，也不能反推生产工具的真实执行或广告主授权已通过。

### 运行标识

- 独立草稿：`plugin_asdk_app_6af04252daf48191b4656176b44669c1`，Private metadata diagnostic，未提交、未发布。
- scan：`asdk_app_6af04252daf48191b4656176b44669c1~AppsSDKContinuousScan_628082a9309c8191ba794c6ffaf28522`。
- attempt：`01a1bdf8-c091-7c15-996c-79c1eefa1a6e`。
- 状态查询 request ID：`req_ed565c15e3024543bc350d9f8f001b33`，不是不可见的内部审查请求 ID。
- Worker 版本：`d50fe6e8-a64c-4887-aeef-df403f9ad699`，仅临时 `/mcp/scan-controls/*`，full-ui 给所有客户端相同完整目录，拒绝全部业务执行，无执行凭证。
- 匿名 10 页目录、共享指引和原 UI 均与冻结候选精确相等。白名单日志 29 条，20 次 tools/list、2 次 resources/read 均 200；一条 400 与预检 GET 的 406 未阻止本轮完成，没有改协议伪造成功。

## 范围核验结果

详细证据和建议见 [正式目录上线前的范围决策](./MCP-RELEASE-GATES-2026-11-09.md)。本轮除了文档核实，还做了禁止网络的请求构造和纯占位响应 renderer 检查：

1. TikTok 游客设备注册仍在 988 工具中，现有排除表漏掉该引用，与“公开范围不含设备注册/游客凭证”声明冲突。占位 cookie 字段能通过通用 renderer，因此不能靠已有脱敏器假定范围限制已落实；没有生成或读取真实 Cookie。
2. 人群包请求使用选中渠道凭证；BeatAPI 用户/钱包 OAuth 不会在这个插件请求阶段变成 Bilibili 广告主登录。相同虚拟渠道/凭证、不同模拟用户 ID 得到相同请求，但不能据此证明所有生产用户共用渠道或存在越权。实际资源归属、数据方许可和委托范围仍缺运行侧证据。

建议仅在公开 ChatGPT 目录排除设备注册，并在人群包授权证据齐备前暂缓公开后者；原 API、本地工具及其他能力保留。**这需要用户确认，本轮尚未实施，完整候选仍为 988 工具。** 不通过改名称、隐藏输出或删除真实用途来规避范围问题。

## 清理与状态

09:47:39 精确删除专用诊断路由 `e4aed456c0c044faabc78fa83ad1adca`，原验证路由保留。09:47:59 匿名复验正式 initialize 200、域名验证 200、诊断入口 404，随后结束本轮 Ego 任务并关闭本轮临时页，未操作其他用户窗口。

网关已有五个未提交文件保持原状，没有编辑网关、改变公开排除表、上线正式目录或上传新正式 ZIP。正式目录激活、原正式草稿重扫、真实用例复测/录屏及审核提交均未执行。

后续先取得公开范围决策：若获准，只改变公开编译策略并保留原 API，重新冻结与验证新公开目录；若保留人群包，先补非敏感授权归属证据。之后再做正式目录影响复核和单独激活确认，不把本次独立扫描转写为正式草稿扫描。

证据目录：`submission/artifacts/mcp-instagram-scope-20261109/`。历史候选与扫描保持原样。

后续用户已确认仅调整公开目录，落实结果见 [公开范围调整与新目录](./MCP-PUBLIC-SCOPE-2026-11-09.md)。本报告保留 988 工具阶段的历史状态，不代表新的 986 候选或正式端点已上线。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
