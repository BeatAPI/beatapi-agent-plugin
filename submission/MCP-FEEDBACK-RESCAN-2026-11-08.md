# 修复后完整目录独立重扫

> 2026-11-08。本轮只部署临时独立诊断 Worker，并重扫原独立草稿。没有改正式 `/mcp/openai`、正式草稿、网关、DNS、OAuth 或计费；未提交审核/申诉、未发布、未提交或推送 Git，也未调用付费业务工具。

## 扫描结论

12:56:39 UTC，完整 **988/988 工具 complete**，共享 instructions 也 complete；`problem` 与 `active_run` 均为空，没有再次出现 `unknown`。

| 关注项 | 本次结果 |
| --- | --- |
| 3 个已修复的数据工具 | 原具体反馈全部消失，也没有新的具体名称/说明反馈 |
| 18 个未改名称的文本模型 | 16 个不再出现名称反馈，2 个 HC 变体仍被标记 |
| 其他工具 | 新增 1 项 X 趋势工具说明不清 |
| 通用 further-review | 838 条，不能当作已获公开审核批准 |

### 三项修复

| 稳定引用 | 原问题 | 本次具体反馈 | 仍有通用复核提示 |
| --- | --- | --- | --- |
| `data:tiktok.web.device_register` | 说明不清 | 无 | 无 |
| `data:tiktok.web.fetch_live_im_fetch` | 名称不清 | 无 | 有 |
| `data:weibo.web_v2.fetch_all_groups` | 说明不清 | 无 | 有 |

直播参数工具已按 `beatapi_tiktok_get_live_comment_parameters` 的新名称发现，门户原说明也已更新，不是读到旧描述后误报“修复通过”。设备注册本轮没有具体反馈，不代表其游客设备/Cookie 能力已解决项目公开范围冲突；该待决问题仍保留。

### 18 个保留名称

本轮仍有名称反馈的两个固定引用：

- `model:deepseek-v4.1-flash-hc`，工具 `beatapi_generate_text_deepseek_v4_1_flash_hc_2c64bd66`。
- `model:deepseek-v4-pro-0813-hc`，工具 `beatapi_generate_text_deepseek_v4_pro_0813_hc_1a30d1b2`。

其余 16 个名称在本轮未被标记，但所有 18 个仍有通用 further-review。完整逐项记录在 `comparison.json`，不把“名称反馈消失”写成“审核通过”。本次只更改三个数据工具的展示，18 个模型描述符保持不变；全目录上下文确有变化，因此仍不能把结果当作完全相同输入的 A/A 随机性证明。

另确认门户的数据映射：所有 988 项中，`definition.name` 和 `definition.title` 都是 MCP 工具的 `title`，`definition.action_name` 才是技术工具名，门户条目的 `name` 也是技术名。这是对公开响应的实际观察；不能据此断言内部检查器一定读取哪一个字段，但后续复核两个 HC 名称时应同时检查可读标题和技术名称，不宜仅凭 `generate_text` 前缀认定必然误判。HC 的真实业务含义尚未核实，本轮没有臆测或改名。

### 新增反馈

`beatapi_data_twitter_web_fetch_trending_18992394a0` 的当前说明为“趋势.”，收到说明缺失/不清反馈。本轮仅按固定完整候选重扫，没有在扫描中途再改文案、参数或目录。它与两个 HC 变体是本轮剩余的 **3 项具体反馈**，另有上述通用复核提示。

## 证据与保真

- 诊断草稿：`plugin_asdk_app_6af04252daf48191b4656176b44669c1`，明确为 Private metadata diagnostic，未提交、未发布。
- scan：`asdk_app_6af04252daf48191b4656176b44669c1~AppsSDKContinuousScan_68edd89086288191b559354d7af68761`。
- attempt：`01a1bb37-6fcb-703d-9a61-c144e83fa823`。
- 状态查询 request ID：`req_557c94265ae148d8aec6b744a2f3ded0`，这是读取结果的请求，不是不可见的内部审核请求。
- Worker 版本：`acafa1e8-154c-4ddc-b0cc-3e7129efa652`；只挂载 `/mcp/scan-controls/*`，窗口截止为 14:00 UTC，业务执行一直拒绝。
- 候选 SHA-256：`095d28007ad026fba048ab68a1a0a9c51faf6b9fbb3dd6578a7efa73cf7859e5`。部署输入与归档候选文件字节相同，保留全部 988 项能力和输入/输出 Schema、默认值、权限、固定引用及原 UI。
- 本地重新执行 21 项离线审计和 Worker 5 项回归，均通过；CF dry-run 后才部署。
- 扫描前匿名读取全部 10 页和原 UI，与固定候选逐项相等。扫描后再次比较门户全部 988 项的 action_name/title/description/input_json_schema/output_json_schema，与该候选精确相等。
- 该版本日志中，20 次 tools/list（本地预检与扫描各 10 页）和 2 次 resources/read 均为 200；没有记录业务参数或浏览器凭证。另有 1 次非法请求 400，完整扫描仍成功，未为此改变协议行为。

## 清理与后续

13:00:27 UTC 精确删除诊断路由 `2ae4e7aa0c0c4befb5106fa81e3c7a68`，原域名验证路由 `04dd926d699240c6831d72824947f1e4` 保留。13:00:48 匿名复验：正式 initialize 200、域名验证 200、诊断入口 404。浏览器任务结束，仅保留独立草稿结果页供查看。

当前可继续核实两个 HC 路由标签的真实含义和可读标题，及 X 趋势工具的实际用途/输入后修订说明；不需要删模型或放宽参数。原来针对 18 个名称的英文说明已是历史草稿，不能直接当作本轮仍有 18 项问题使用。所有材料保存在 `submission/artifacts/mcp-feedback-rescan-20261108/`；本轮完成诊断扫描不等于正式更新或送审通过。

## 后续核实

两个 HC 已由第一方文档确认为 high-cache，X 国家趋势说明也已补全；后续完整复验见 `MCP-HC-TRENDS-2026-11-08.md`。技术工具名零变化，三项目标反馈在后续轮次消失，不改写本报告的历史状态或原始响应。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
