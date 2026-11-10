# Instagram 两项搜索说明修复与正式验收

> 用户要求处理剩余两条反馈，稳妥准备原草稿，最后提交留给用户。未授权自动提交审核或发布。

后续：本轮六条名称反馈已在 `ffe8fbb7b` 修复并部署，最新正式扫描及发现工具复核状态见 `MCP-RANKING-NAMES-2026-11-09.md`。本文件保留原轮次事实。

## 核实与设计

两条问题成立：旧说明只有“综合搜索”和“综合搜索（支持分页）”，不足以区分结果范围、查询字段和分页方式。已核对固定 schemaHash 的 BeatAPI 契约及接口第一方开发说明；内部来源不进入公开插件或对外审核说明。

- V2：keyword 搜索用户、帖子和 Reels 等混合结果；首次省略 pagination_token，后续沿用返回 token。
- V3：query 搜索用户、话题标签和地点；话题搜索保留 # 前缀。首次省略 next_max_id/rank_token，后续同时沿用响应值，按 has_more 继续；enable_metadata 为布尔值，默认 true，结果可能重复。

在统一 remote-presentation 词典增加两个精确 reference 的领域说明，没有新建参数适配层。两个技术名均保留，仅修改 title/description；986 工具、982 绑定、其余 984 描述符及全部输入输出 Schema、默认值、required、nullable、历史读取枚举、annotations、scopes、schemaHash、执行模式、指引和 UI 不变。不声称有私有数据访问权限或业务实测成功。

## 发布与回滚

基于最新 origin/main `243229fdf1170cb7c712b8ba7620181f49832dbb`，只提交网关目录和模块地图，发布提交为 `19ef64b10dfa060e847e41e961b3ed65728f7507`。独立 worktree 避免包含原后端的五项未提交改动。

完整目录备份、摘要、仅本轮反向补丁检查和回滚步骤保存在 `artifacts/mcp-instagram-final-20261109/`。回滚只 revert 本轮提交，不撤销前次八项或其他业务改动；不涉及数据库迁移，不声称实际回滚演练。

21 项展示/保真回归及完整 MCP race 回归通过；新增测试覆盖 V2/V3 字段与游标隔离、空字符串/省略语义保留、布尔 false 不丢失、错误类型/缺参/多余字段拒绝。候选全字段断言和 diff 检查通过，不把这些定向测试声称为全仓库回归。

[部署工作流 42633921557](https://github.com/fengshao1227/beat-new-api/actions/runs/42633921557) success，22:34:17 结束，耗时 12 分 29 秒；精确提交服务检查和 Craft 路由检查成功。新正式目录完整 986 描述符/指引逐项匹配候选、健康 200 后，才扫描同一 0.4.0 草稿。未重复上传相同 ZIP、重置声明或读取审核登录字段；最初部署未完成时读取到旧说明，未在该次结果上启动扫描。

## 正式扫描结果

本轮只点击一次 Rescan，结果直接保存在原草稿：

- scan：`asdk_app_6aed1b32cb0c81919339954cee14a350~AppsSDKContinuousScan_d50be41ea5688191853deec9442c3fa1`。
- attempt：`01a1c0b7-2be9-7ab3-b5f8-567245166b06`，scan_time 22:32:57，完成于 22:34:01。
- 986/986 complete，problem=null、activeRun=null，共享指引 complete 且无反馈，没有 unknown。
- 两个 Instagram 说明的具体反馈均消失，各余一条通用复核提示。全目录有 326 条通用提示，allToolsPass=null，不是审核通过。
- 又标记六条既有技术名称不清楚：Bilibili `popular_up_x_huo`、`x_huo_date_options`，以及 Douyin billboard `fetch_hot_total_high_fan_list`、`fetch_hot_total_high_like_list`、`fetch_hot_total_high_search_list`、`fetch_hot_total_high_topic_list`。
- 六项完整定义与本轮发布前逐字段相等；这些是历史出现过的反馈重新被标记，不是本轮改变执行行为导致六个运行故障。未继续盲扫或擅自批量重命名。

门户保存的全部工具 action_name/title/description、input/output Schema、annotations、认证声明和共享指引已逐项匹配候选。扫描状态、定义保真和反馈分类见 `comparison.json`，六项不变证明见 `new-findings.json`。因此不能宣称“只剩点击提交”，仍须核实并处理名称问题。

原正式草稿保持未提交、未发布；本轮未提交审核、申诉或发布，最后提交动作仍保留给用户。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
