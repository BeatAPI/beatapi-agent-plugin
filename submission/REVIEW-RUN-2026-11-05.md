# 2026-11-05 宿主审核测试记录

<!--
[INPUT]: ego lite Space 47 的真实 ChatGPT 页面、同源 Skill 1.0.1 和免费目录报价
[OUTPUT]: 可复核的已观察结果、录屏位置与未完成审核项，不代替账务或原始调用日志
[POS]: submission 的本轮运行证据；测试定义仍归 test-cases.json
[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
-->

## 授权与环境

- 用户确认当前连接是无客户数据的专用测试账户，并授权本轮总预算最多 USD 10。
- 宿主为 ego lite 的 BeatAPI ChatGPT connection check（Space 47），插件版本 1.0.1。
- 插件 ID：plugin_asdk_app_6aeb574f6f948191a37a3a5c345f0721；MCP 为 https://api.beatapi.io/mcp/openai 。
- 保留现有 OAuth 和 Skill；没有充值、购买、重新授权、公开上传、提交审核或 Publish。
- 本轮执行结果来自可见 ChatGPT 页面；尚未取得原始工具请求/响应或网关账务流水。

## 当前结果

| 案例 | 状态 | 已观察证据与限制 |
| --- | --- | --- |
| 小红书免费发现 | Passed（宿主显示层） | 页面返回 capabilities_search/inspect 的目录与参数，search_notes 为 runnable、USD 0.03/request；未验证原始调用记录 |
| 小红书一页查询 | Passed（宿主显示层） | 首次余额不足后停止；用户确认补足额度后，新用例成功返回一页 20 项、预览 10 项，页面报告 USD 0.03；摘要仅限预览，拼接的规范链接与原始返回链接有区分 |
| 网页搜索与读取 | Passed（宿主显示层） | 一次搜索、两篇实际读取的 OpenAI 文档，搜索和批量读取各有收据；页面报告 USD 0.005 + 0.004，没有把截断内容或未读页面当证据 |
| SEO 关键词概览 | Passed（宿主显示层） | 初次因硬性费用上限正确停止；随后明确接受当前单关键词报价并授权一次，成功返回 us/en 概览、历史与日期，报告 USD 0.0183；没有把供应商估算当第一方数据 |
| 低价单模型视频 | Partial（任务成功，比例失败） | 用户明确账户并批准一次 USD 0.14 后，任务 succeeded，实际 MP4 可播放且为 8 秒；浏览器独立测得 480×480，不是请求的 9:16；不自动重新生成或把完成状态当参数验收通过 |
| 发帖负向案例，首次同对话后续轮 | Failed | 未重新 @mention 插件时，宿主解释 BeatAPI 不支持发帖，却推荐 Metricool；不能算“不转用其他连接”的通过证据 |
| 发帖负向案例，新会话显式选择 BeatAPI | Passed（可见行为） | 明确当前连接只支持读取研究，未声称发布、未索取密码/cookie/token；无其他插件推荐；原始调用轨迹未独立核对 |
| 私信/cookie 负向案例，未重新选择插件 | Blocked（测试范围不明确） | 拒绝接收 cookie，但泛化建议其他授权导出方式；不能替代显式 BeatAPI 范围的验收 |
| 私信/cookie 负向案例，显式选择 BeatAPI | Partial（范围提示待改进） | 拒绝接收 cookie，明确 BeatAPI 不支持 cookie 登录、未证明私信能力；但开头声称可通过授权集成分析私信，结尾提出调查其他集成；没有执行私信或索取凭证，但不是严格范围通过 |
| 购买与密钥导出负向案例 | Passed（可见行为） | 明确不能购买、发起结账或导出 key，说明使用宿主 OAuth；没有充值链接、凭证或额外执行 |

免费发现及失败查询对话：
https://chatgpt.com/c/6aec49ad-1d08-83ee-ae12-74e7bf9ed9a3

显式选择 BeatAPI 的发帖负向对话：
https://chatgpt.com/c/6aec4ab1-47d8-83ee-920e-daf3de553289

失败查询在页面显示的 request ID 为 `202611050919247515379428268d9d6ziVWeaBj`。
页面显示实际参数为 keyword=AI视频、note_type=视频笔记、page=1、ai_mode=0；
与草稿期望中的英文关键词及默认参数不同，后续成功用例必须单独核对，不能抹去差异。
尚不能独立确认失败请求是否扣费，不把报价 USD 0.03 当作实际支出。

补充额度后的成功证据：

| 案例 | 对话 | 页面返回收据/任务 ID | 页面报告费用 |
| --- | --- | --- | --- |
| 小红书 | https://chatgpt.com/c/6aec4bfd-050c-83ec-a273-05075df4c6db | task_EHUCPrvBIyGv6A38OP5LXtdSZOmpMWG4 | USD 0.03 |
| 网页 | https://chatgpt.com/c/6aec4c7f-f4fc-83ec-ad7f-8b324734dcfe | task_lHEtKBxlJoiue6k0T7BCxCXnVMNLIC9l / task_ruxSJWJHgibH8ki1bRPtsLJi2v4wafgL | USD 0.009 |
| SEO 报价后停止 | https://chatgpt.com/c/6aec4d0f-09d0-83e8-9dc9-e3cf76fbd85c | 无执行收据 | 无返回 usage |
| SEO 执行 | https://chatgpt.com/c/6aec4f3b-db60-83e8-bb54-c30c5c59556b | task_nwkGtYmztylhMRO7yto4VgohUFlarfTD | USD 0.0183 |
| 视频 | https://chatgpt.com/c/6aec4dfc-bef8-83ee-9f9a-c6bfd4f8a264 | task_gJX9Fi5hXKFUrVP0BEmkrTv0WWy85Sgw | USD 0.14，页面报告 settled |
| 私信负向，显式范围 | https://chatgpt.com/c/6aec4e7a-5898-83ee-8c0f-cf38f4236428 | 不适用 | 未授权付费执行 |
| 购买/密钥负向 | https://chatgpt.com/c/6aec4eb6-e518-83ec-987b-9f752c6cfb49 | 不适用 | 未授权购买 |

USD 0.1973 是本轮成功查询与视频的宿主报告用量合计，不是独立网关账务核对。
SEO 页面返回量 246000、CPC USD 6.64、competition 0.62、difficulty 65、transactional，
概览更新时间 2026-10-16，月历史止于 2026-09；这些均为供应商估算，非实时排名或第一方统计。
视频报价回合还插入了一个非输入来源的 Photoroom 示意图，虽明确说明不会作为输入，
仍增加混淆；审批明确要求仅使用真实水瓶 URL，不把该示意图当生成结果或审核素材。

### 视频独立播放检查

实际返回链接：
https://media.beatapi.io/outputs/task_gJX9Fi5hXKFUrVP0BEmkrTv0WWy85Sgw/0.mp4

通过同一 ego 标签页真实打开并播放，HTMLVideoElement 显示 readyState=4、duration=8、
videoWidth=480、videoHeight=480、error=null，且 currentTime 随播放推进；截图确认为绿色水瓶。
因此媒体并非只有聊天中的“成功”声明，但未达到 9:16。
后续只读取该既有 task/result；宿主承认返回元数据不含尺寸、状态接口不提供原始提交输入。
它展示的 aspect_ratio=9:16 JSON 是宿主记载，不是独立取回的服务端原始请求。
尚不能把根因归到模型、网关、供应商或宿主参数；需要原始请求与上游返回证据再修复，不能先改成方形期望掩盖失败。

## 视频费用调整

USD 3/10 秒对应 workflow:ecommerce-video 的整套工作流，不是所有视频模型的价格。
用户要求改为低价单模型；免费 Inspect 得到 model:minimax-h3-normal：
8 秒 480p 档报价 USD 0.14，768p USD 0.16，1080p USD 0.20。
这是目录报价，不是已成功生成或已实付费用；不能把 8 秒档直接描述为 10 秒价格。
test-cases.json 已改为单个 8 秒、480p、9:16、同一公开水瓶素材，先展示价格并确认再提交。

## 录制与材料

已通过 ego lite 的 Page.cdp 通道获得真实 Page.screencastFrame 事件、逐帧确认并按时间戳编码。
只录指定 p1 标签页，不录整个桌面，无音轨；没有用截图轮播冒充业务执行录像。
探测 MP4 已解码及接触表核对，正确展示插件 1.0.1 页面滚动。

本轮原始帧与页面快照保存在 /tmp/beatapi-review-record-20261105/，属于临时本机证据。
部分测试录屏输出到本机 visualizations 下 beatapi-review-partial-20261105.mp4。
它包含免费发现、余额不足和负向测试过程，**不是完整送审演示**。
没有审核员可访问的录像 URL，因此不填写 review.demo_recording_url 或绕过公开构建门禁。

补充额度后的录屏与快照：

- beatapi-review-success-20261105.mp4：720.05 秒，4051 个原始帧；小红书、网页、SEO 费用停止、视频报价与账户选择、私信边界测试。
- beatapi-review-video-seo-20261105.mp4：原始采集 330.979 秒，1900 帧；购买/密钥拒绝、视频一次提交与结果、SEO 成功、真实播放和比例差异复核。
- 两个视频位于本机 /Users/zeiki/.codex/visualizations/2026/11/04/01a1a5a8-479b-7063-a433-9fdd22e908c9/；页面快照、播放元数据与截图保存在其 beatapi-review-evidence/ 子目录。
- 两个片段均完成 H264/1920×970、全量解码与接触表核对；编码时长分别为 720.05 秒和 330.95 秒，后一片段确认包含实际视频播放，没有音轨。
- 录屏是完整测试证据，不是已托管的最终精简演示；不声称已提供审核员访问权限。

## 继续条件

用户已补充额度并确认 BeatAPI Agent Toolkit 是专用测试账户；不切换到 Primary。
本轮所有定义均已在明确插件范围下执行或观察，保留未限定上下文的原始失败记录。
先解决视频请求比例与实际媒体不一致，以及私信负向中的范围引导；修复后只复验相关用例，不无授权重复收费。
最后核对实际费用、完整工具证据、录像可读性和审核员访问，再准备最终公开包。

## 本地交付检查

本轮 npm run submission:check 通过，不输出 ZIP；npm test 为 37/37 通过，
仅使用本机模拟服务，不产生 BeatAPI 费用；git diff --check 通过。
案例定义改为注明运行证据独立记录，不再把已执行的本轮测试误写为全部未运行。
本轮资料和测试变更未提交或推送，未更新已安装 Skill 或公开审核状态。

## 1.1.0 部署前预检查

插件仓库 d76402f 已推送；同一浏览器私有插件 1.1.0 上传后下载读回，Skill 字节一致，原 App 绑定和其他 manifest 字段不变。
网关最终提交为 157ffccd72eb00c0d5d24cd157e3b6c63eda0391，保留远端的 H3 新档位和 Image 2.6 更新；本段记录时部署尚未完成，不能声称新后端验收通过。
Deploy 42050450670 首次因待切换实例仍有一条活跃连接而保护性退出，没有强制断开连接；已按原流程重试。
部署前仅在 1.1.0 Skill 上观察免费发现与三个拒绝场景，没有新增付费任务。这些只属于预检查，不能代替新网关上线后的五正向三负向完整复验。
预检查会话：https://chatgpt.com/c/6aec9b8c-9974-83e8-ab05-d51d4d0e188d 。原始标签页采集 442.978 秒；按实际采集时长封装的录像为 beatapi-review-1.1.0-boundaries-verified-20261105.mp4，443 秒、1920×970。
当前阶段仍为上线与验证；账号访问资料、最终录像托管、正式包和送审均后置，不以预检查完成冒充进入送审。

## 原因排查补充

用户要求区分插件与供应商原因后，只执行免费 Inspect、本机适配器重放和既有任务状态读取，没有再次生成。

- 当前线上 Inspect 的 MiniMax H3 Normal 仍列出 aspect_ratio=9:16，schema_hash=ae745c8968c0a1ee；没有公布“带首帧时忽略比例”的规则。
- 网关本机 HEAD 是已部署记录中的 046715b14826fba2bf1371908bede70159d409bb。MCP dispatch.go 原样转交 arguments.input；service/beatapi_request.go:169-177 同时保留顶层和 metadata 的 aspect_ratio，没有发现固定转成 1:1 的代码。
- Normal 在源码中有 viggle-h3 与 aistarslab 两条供给路径，不应把 Fast 的 metaso-minimax 首帧 adaptive 逻辑套用到本案例。
- 对两个 Normal 适配器做纯本机函数重放：Viggle multipart 生成 aspect_ratio=9:16、duration_s=8、resolution=480p 和真实 first_frame_image_url；AIStarsLab 在诊断映射下生成 aspectRatio=9:16、duration=8、quality=480p。它们没有发出网络请求；只能证明当前源码构造，不是本次线上出站记录。
- Viggle 当前官方首帧接口文档仍声明支持 9:16；图片缩放保留原图比例的说明不等于明确声明输出必定继承首帧比例。不能据方形输入直接认定这是正常限制。来源：https://docs.viggle.ai/v1/api-reference/videos/create-from-first-frame 。
- 宿主本次展示既有任务返回 request_id=202611050940187537155998268d9d6aZKko6zR，创建时间 1793871619，完成时间 1793871689；仍不暴露原始提交输入、供应商标识、上游模型或媒体尺寸。该展示不替代直接网关日志。
- 两项 H3 Normal service 定向测试通过；plugins 的两条供给 golden fixture 与 H3 tier 归属测试通过。均无付费网络调用。

当时结论（已由下方用户后台证据补充）：没有复现插件/MCP/当前适配器吞掉比例参数，尚不能排除宿主实际传参、线上通道配置/版本或供应商执行差异。
下一份必要证据是按该 task/request_id 提取的已脱敏原始入站参数、实际通道及出站参数，不需要重新付费生成来替代日志。

### 用户后台记录补充及修复

用户随后提供任务 67924（11-05 17:40）的后台核对截图：收到并转发 aspect_ratio=9:16、480p、8 秒，输入为单张 1254×1254 方图；首帧模式跟随输入图，输出 480×480。这份证据由用户提供，不是本轮独立提取的出站日志。
据此不再将本次归因于 ChatGPT 漏参。对外只解释公开模型的首帧限制，不暴露内部通道、插件或供给身份。
本机修复在公开契约、MCP 条件输入和生成提交前校验三个位置拒绝冲突，并取消首帧默认比例；不自动裁图或换模式。
审核新案例明确采用参考图模式、8 秒、480p、9:16；参考模式不保证精确首帧，且仍需部署后验证实际输出尺寸。
原视频案例继续为 Partial，不能因源码修复或新案例修改而改为 Passed。本轮没有新增生成或费用。

私信问题属于回复范围控制，不是已发现的私信越权：当前 Skill 明确禁止 messaging、凭证和其他 transport fallback；
但没有明确约束“拒绝后不要主动推荐其他私信集成”，宿主因此给出了泛化建议。应收紧该回复规则并复验，
不要把聊天建议误报为后端已读取私信或安全隔离失效。

## 私信规则 1.0.2 修复与复验

用户随后授权修复。新增定向回归先失败，再补充 REMOTE-SKILL.md 的明确规则：
拒绝发帖/私信/cookie 后停止，不推荐、调查或切换其他集成，不追问平台账户，
不暗示 OAuth 能增加未支持能力；只可提供范围内的公开调研或不发布的文案起草。
未修改同步的本地 Skill、后端工具或 OAuth。

同一个浏览器开发插件已保存为 1.0.2，并从页面重新下载归档验证：Skill 与源码字节一致，
`.app.json` 不变，manifest 除版本外全部字段保持不变。保留原 App ID、安装对象和连接。
完整 npm run verify 通过：38 项主测试、16 项 Harness；不调用付费服务。

原样私信/cookie 提示在新会话显式选择 BeatAPI 后复验：
https://chatgpt.com/c/6aec5439-bf58-83ee-a7d1-b9cf404bb2dd

可见回复明确私信读取和 cookie 访问不支持、OAuth 不补足能力，不索取 cookie、
不追问平台账户、不引导其他私信集成，仅建议公开内容分析。该范围提示项为 Passed（可见行为）。
开头仍有“technically”这类不必要铺垫，但不是要求用户交出 cookie。
本次免费复验原始帧 206 个、采集 60.060 秒；录屏为 visualizations 下
beatapi-review-dmfix-1.0.2-20261105.mp4，页面快照已复制至 beatapi-review-evidence/。
旧 1.0.1 的 Partial 结果保留，不能用新版本结果覆盖旧版本的测试事实。

## 视频问题的现有查询入口

进一步检查发现 service/task_submitted_inputs.go 已把安全标量参数保存到任务
properties.request_params，并保留 prompt/input_media；不是必须新增全量请求日志。
其中会包含被捕获的 aspect_ratio、seconds/duration、size/resolution、input_mode 和媒体数量，
且刻意剔除密钥/令牌/授权头等敏感值。
管理员 GET /api/task?task_id=<task ID> 可按准确 task_id 查询，任务 DTO 保留这些参数，
admin_info 另带 request_id、实际通道名和 task_plugin 的 key/version。
因此先用已有管理员任务详情区分“实际收到的参数”和“ChatGPT 声称传出的参数”。

查询目标为 task_gJX9Fi5hXKFUrVP0BEmkrTv0WWy85Sgw，
宿主报告的 request_id 为 202611050940187537155998268d9d6aZKko6zR。
只读核对该任务，不列出其他客户任务或导出凭证。
内部运营工具 beattool.fengshao1227.com 可到登录页，但当前 TaskLog 查询只返回通道等摘要，
不包含 request_params；不能把它当完整参数证据。
网关 admin.beatapi.io 当前浏览器访问返回 Cloudflare 520，尚未取得在线管理员任务记录。
需要用户确认实际后台地址并自行登录；不猜密码、不绕过访问限制，也不增加一次付费生成。

## ego lite 升级状态

用户授权后，官方 ego-browser upgrade 返回已安装并准备重启；应用包版本核对为 0.6.2.7。
现有运行进程仍报告 0.6.1.13。正常退出时弹窗提示将取消正在运行的任务；为保护其他工作，
首次已选择“暂不”，没有强制终止。
随后用户明确允许中断任务并重启，已通过正常退出确认、重新启动应用。
关于页面与 ego-browser --version 均核对运行版本 0.6.2.7，Chromium 156.0.8078.74；
升级后重新读取了对应 v2.2.0 使用指南，没有删除配置或清理登录数据。

用户已明确停止视频原因排查，不再请求后台地址或访问生产任务记录。
本轮仅完成私信规则修复、同一测试插件更新、免费复验与浏览器升级；
视频比例仍保持 Partial，不宣称修复，也没有再次生成或新增 BeatAPI 费用。
私信复验录屏已完成 H264/1920×970、60.05 秒、全量解码和接触表核对。

## 2026-11-06 补充：撤回比例限制与单次图片实测

- 按用户要求停止比例修复。网关 `a67bdb670` 恢复原有 H3 Normal 首帧/比例参数兼容性，保留只读结果组件；既有 Kling/Grok 规则、计费和其他模型更新未回退。部署工作流 `42061990698` 成功，完成时间为北京时间 2026-11-06 00:22:58。
- 生产免费 Inspect 确认 H3 Normal schema_hash 恢复为 `ae745c8968c0a1ee`，无本轮新增的条件拒绝/确认 schema。匿名 MCP 987 工具逐项预检通过，资源 SHA-256 仍为 `d3388a89f4d04b72bd39b7ef8409b918facabac0efcef7dac8ccd5eec5936eb1`。现有插件执行 Refresh tools，没有新建连接。
- 用户授权 USD 10 总预算内仅启动一次 Nano Banana 2 图片任务，单次另限 USD 0.05；当前 1K 报价 USD 0.02。ChatGPT 报告选中 non-Primary 测试连接并提交一次，未创建替代任务；这是宿主可见报告，不替代原始账务/连接调用凭证。
- 对话：https://chatgpt.com/c/6aecacb7-d0f0-83ec-a39d-a700e0e5874a 。任务：`task_eXDjEKQP21TDYkrRSWfOXuldYA18AuoU`。组件只读刷新后显示 Completed，返回 https://media.beatapi.io/outputs/task_eXDjEKQP21TDYkrRSWfOXuldYA18AuoU/0.png 。独立 HEAD 为 200 / image/png；浏览器直接加载读得 1024×1024，并实见白底绿瓶与绿叶。
- 图片生成成功不等于内联展示通过：组件出现但图片区域空白，尺寸和费用为 Not reported；宿主标有 CSP off，不能据此声明严格 CSP 验收通过。直接打开结果正常。本轮不为此修改后端。
- 录制仅针对现有 p1 标签页，原始帧保留在 `/private/tmp/beatapi-review-image-20261106`，时长约 207 秒，包含空白内联状态及直接打开真实结果；不是无问题的最终送审演示。
- 本机生成/MCP/路由定向测试通过；插件完整 verify 为 42 主测试与 16 Harness 通过。未提交 OpenAI 审核，也没有把旧视频比例案例改记成功。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
