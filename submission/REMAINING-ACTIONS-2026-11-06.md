# 最终准备与责任边界

## 已处理

- 当前同一 0.4.0 草稿已重新下载并逐文件比对：7 个文件内容与修订包完全相同，包含三语文案、发布说明、MCP、Skill、案例和图标。门户的短暂旧文案不是下载包内容回退，不再重复上传。
- 门户 Review information 明确只提示 Reviewer credentials 缺失；地区、翻译、正负用例和 Supporting content 均未标记缺失。未点击 Save details，未代填任何凭证。
- 987 个工具的三个风险标记均已按当前契约准备英文理由，覆盖 983 个能力启动工具、2 个已存任务/结果读取工具、2 个目录读取工具，见本机 `artifacts/public-package-20261106-listing/tool-annotation-justifications.json`。
- 能力启动会持久化请求/结果或创建任务，并可能消耗余额，因此并不因其读取社媒内容而标为纯只读；任务/结果/目录查询不启动新能力调用。说明不改变现有标记或网关行为。
- 当前扫描未完成的工具详情页只有定义和结果，没有理由编辑入口。理由材料已准备，不声称已导入门户；恢复扫描后再完成门户实际出现的技术说明。
- `npm run submission:check` 再次通过；本轮不修改运行代码、正式 ZIP 或线上部署，不执行付费任务。

下载包、逐文件比较和本轮链接检查均保存在同一 artifacts 子目录，不放到个人临时目录。历史录像及原始证据继续保留。

本轮官网、支持入口、隐私政策、服务条款、演示录像 5 个公开链接的 HEAD 跟随跳转均为 200。这里只复验可达性，录像实际播放证据仍以此前记录为准。

## 用户必须提供

1. 在原草稿 Review information → Reviewer credentials 安全字段填写专用账户登录资料和实际登录步骤。密码不进入聊天、公开 ZIP、支持工单或 Git。确认审核员无需你实时提供验证码即可独立登录，账户无客户数据，且审核期间有足够额度和适当权限。
2. 提交前由授权主体亲自核对当前政策/法律声明，包括适用的年龄、隐私、内容及商业行为事实。不能用“本机测试通过”代替真实声明，也不在准备阶段提前替用户勾选。
3. 技术阻塞解除并完成复核后，明确授权提交审核。目前仍禁止提交，发布也需另行授权。

## 外部阻塞，不应让用户猜配置

MCP 扫描以 unknown 终止，不能靠填写审核账号或重复上传解决。去敏复现说明已通过当前登录账户的 OpenAI Help Center 支持聊天发送，首条消息包含转交扫描团队查询 run ID 的请求，且已看到支持 AI 的回复。随后补发明确转人工请求时页面导航超时，未确认发送，不声称已转人工、已创建工单或取得编号。附件已整理为 `artifacts/public-package-20261106-listing/scan-support-evidence.zip`，尚未上传给支持方。

已在同一支持标签页做一次恢复导航；页面恢复，但聊天入口未在限定时间内重新出现，停止重试。支持材料归档 CRC 检查通过，可供官方要求补充资料时直接使用。

在 OpenAI 提供失败阶段或恢复扫描前，不能声称“只剩用户账号、其余都通过”。不因未知错误擅自删减工具、修改后端或重新授权。具体复现及支持文案见 `MCP-SCAN-INVESTIGATION-2026-11-06.md`。

## 审核登录说明草稿

以下操作说明不含用户名、密码或未经确认的登录方式。先在安全字段补充专用账户的实际登录方法，再使用：

> Connect BeatAPI Agent Toolkit and sign in with the dedicated review account using the login method and credentials supplied in these secure reviewer fields. Approve the displayed OAuth consent for the production client. The account contains no customer data. Follow the five positive and three negative test cases supplied by the plugin package. Inspect the selected capability and its current inputs before execution. Use only the review account balance, and stop if an operation is unavailable or the balance is insufficient. Check an existing task/result rather than submitting a replacement request to retrieve output. No social posting, private messaging, account management or purchases are required by these tests.

账户可用性、余额和独立登录能力仍需真实验证；此草稿不是凭证验证通过证明。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
