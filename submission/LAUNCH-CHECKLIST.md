# BeatAPI Agent Toolkit 正式上线准备

> 2026-11-04 核对。这里区分代码、生产元数据、用户验收和 OpenAI 审核，不把任意一项代替另一项。

## 当前状态

| 项目 | 状态与证据 |
| --- | --- |
| 插件名称 | BeatAPI Agent Toolkit；稳定 ID 为 beatapi-agent-plugin |
| 企业署名 | 用户确认 Logiavox LLC，公开包 author.name 与 developerName 已同步；门户仍需选择对应认证身份 |
| 展示语言 | 默认英文，zh-CN / ja-JP 翻译与图标同源导出；宿主实际切换语言的展示尚未验收 |
| 连接 | 用户已确认 ChatGPT 中授权连接和工具调用成功；不是本文作者独立重跑全部案例 |
| 服务 | https://api.beatapi.io/mcp/openai 匿名 initialize 返回 MCP JSON，2026-11-04 实测 |
| 图标 | 沿用正式品牌：浅/深色 1024px PNG，180px 小图标；补齐 composerIconDark 与源检查 |
| 工具契约 | 网关 046715b14826fba2bf1371908bede70159d409bb 已推送且部署成功；生产 982 工具严格匿名比对通过，7 项范围排除已生效 |
| 展示资料 | 完整工具集描述、3 个开场提示、全球可用地区选择和既有余额说明已在构建源中 |
| 审核案例 | 5 正向 + 3 负向，已整理为平台字段并写入包；仍为未执行草稿，不是通过证据 |
| 演示图片 | 自制无品牌 Demo Bottle，已上传正式 R2 素材桶、公开 GET/摘要核对通过，案例已填真实直链；见 DEMO-ASSETS.md |
| 政策补充 | 网站 26eb4bb711de717a25769be95e23f3e0fbf81016 已部署；英中日六个政策页均匿名回读 200，新增正文与 2026-11-04 日期匹配 |
| 正式送审 | 尚未提交；网关和网站已部署验收，插件公开目录、展示资料与打包门禁由本次源码提交交付；不声称已审核或已发布到 OpenAI 目录 |

截图中的私有 Test 已读取确认是手动 MCP 的 App 绑定版，并未自动使用仓库完整展示资料。
当前同源资料已导出，并已将原私有 Test 的技能更新到 1.0.1，读回与源码一致且
保留原 App 绑定。展示资料仍是旧值：浏览器停在 Cloudflare 验证，本机电脑控制
接口也不可用；图标、英文文案和分类尚未在账户 App 中更新。
详见 PRIVATE-PREVIEW.md。企业 By 署名和目录多语言展示不能仅靠本地字段保证。

## 发布前按此顺序完成

1. 固定工具版本：先完成任务化 API 整理，再冻结本次范围。逐项检查名称、说明、入参、风险注解、scope、收费和异步 next。不能用通用执行器隐藏未审核行为，也不能把数百个模型/API 清单写入 Skill。
2. 发布主体已由用户确认 Logiavox LLC，公开包已同步。进入门户时选择对应已认证企业并核对导入的显示名；本文不代替门户验证。地区选择所有可用国家，不承诺绕过平台、供应商或地区限制。
3. 政策补充已发布：beatapi/src/content/pages/ 的三语隐私/条款已补齐 OAuth 授权记录、工具输入/结果、上游共享、撤销与删除申请边界，以及网站独立充值、插件消耗已有余额的模式。六个线上页面已回读验证；后续政策变更仍沿用网站发布与线上回读流程。没有新增保留天数或上游无训练承诺。
4. 准备审核专用账户：无客户数据，可独立登录，预先具备全部案例所需余额与权限，设置合适日限额。密码和登录指引只填 OpenAI 后台安全字段，不能放仓库、ZIP 或录像。不要使用需要审核员拿到你的短信/邮箱验证码的账户。
5. 演示图片已完成：DEMO-ASSETS.md 记录 AI 生成的无品牌水瓶及公开直链，媒体案例已填入。送审前再次确认可读取；对每次付费执行先确认范围和当前价格，不重复启动慢任务。
6. 在 ChatGPT 跑 test-cases.json 的全部案例，逐条记录实际工具、参数、结果、耗费与通过/失败/阻塞状态。新增 SEO 案例不能用已有“连接正常”的反馈替代；文本/决策模型另做补充验收。
7. 录制真实演示并托管：见下方脚本。回放并核对审核员权限后，通过 submission:build --demo-recording-url 传入链接，构建器写入 review.demo_recording_url；缺链接会拒绝生成公开 ZIP。URL 检查不代替人工播放验证，脚本和截图不是录像。
8. 最后生成公开 ZIP 并检查包内 manifest、MCP、Skill 和图标。进入 OpenAI Platform 的 Plugins，选择企业身份和 With MCP，上传为草稿；不要把本地 stdio marketplace ZIP 当公开包。
9. 在门户完成该版本的连接、域名验证、工具/Skill 扫描和测试。回调地址从门户取原值加入网关客户端白名单，不假设与开发连接相同。现用 beatapi-chatgpt-test 只作为已测试客户端，不擅自当正式送审客户端。
10. 由企业授权人员确认法律/政策声明并提交审核。获批后再主动 Publish。上传、提交审核、获批和发布是四个不同状态。

## 工具整理的具体风险

发布前独立扫描确认线上仍暴露 data:bilibili.huahuo.account_session_info，严格比对失败。
网关 046715b14826fba2bf1371908bede70159d409bb 随后经 Deploy 工作流
https://github.com/fengshao1227/beat-new-api/actions/runs/41801031927 部署成功。
发布后使用同一官方 SDK 扫描器（本机 Node TLS 连接失败时以 curl 适配传输）重新比对，
982 个工具全部匹配；目录摘要 d29a67b8e96a34804872b2504ce245ceb4c9d470f9da94ab392374be8fc9289d。
证据保存在 ignored 的 dist/submission/post-deploy-tools.json，仅证明匿名元数据，不代表宿主案例通过。

2026-11-04 全量匿名工具扫描返回 989 个工具。旧目录的严格预检在
beatapi_get_capability_task 的 inputSchema 上失败：线上 reference 枚举包含
model:gemini-omni-1.1-flash，而旧目录的任务枚举不包含它。没有放宽一致性校验；
重新拉取全部公开契约后，完整 OAuth 元数据与 989 个工具的严格比对通过。
新构建目录位于 ignored 的 dist/submission/release-audit-catalog.json；
独立预检报告位于 dist/submission/release-audit-preflight.json，状态为
anonymous-metadata-matched，不是宿主业务测试结果。

本轮已在公开编译策略中精确排除以下 7 项，并重新生成网关内置目录：

- data:douyin.app.v3.open_douyin_app_to_send_private_message
- data:tiktok.app.v3.open_tiktok_app_to_send_private_message
- data:douyin.app.v3.register_device
- data:bilibili.huahuo.account_session_info
- data:douyin.web.fetch_douyin_web_guest_cookie
- data:tiktok.web.fetch_tiktok_web_guest_cookie
- data:tiktok.web.generate_real_mstoken

私信项描述为生成唤起链接，不是已经验证会自动发送私信；这里是产品范围收敛，
不是宣称供应商存在越权。公开联系人查询、评论关键词等正常调研仍保留，没有用
cookie/token/contact 等模糊关键字一刀切。原 API-key 接口与本地三工具不受影响。

策略唯一来源为 scripts/remote-capabilities.mjs，验证器拒绝旧目录重新引入这些 reference。
新的 dist/submission/review-catalog.json 已写入网关 service/beatmcp/catalog_default.json；
本地编译与网关加载测试均通过，且已部署并完成上述生产比对。后台上传目录优先于内置目录，
今后更新仍须核对实际选用版本；不能用代码部署或旧 989 工具报告替代线上严格比对。

## 本轮验证记录

| 检查 | 结果与边界 |
| --- | --- |
| 插件完整离线 verify | 37 项主测试 + 16 项 Harness 测试通过；录像缺失拒绝/链接入包回归已先失败后通过 |
| 网关 beatmcp race | go test -race ./service/beatmcp -count=1 通过；无线上付费调用 |
| 范围回归 | 插件和网关原目录均先观察到排除测试失败，修复/重建后通过；7 项移除，正常调研与媒体保留 |
| 审核工具绑定 | 5 个正向案例的工具名均存在于新 982 工具目录 |
| 匿名免费发现 | SDK Search/Inspect 独立协议检查，证据保存在 ignored dist/submission/free-discovery-evidence.json；不是 ChatGPT 宿主测试 |
| 宿主审核案例 | 仍未逐条执行并录制；用户之前的连接成功反馈不替代本组案例证据 |
| 三语政策回归 | beatapi 的政策/静态页/发布语言 3 个测试文件共 9 项通过；不代表生产页面已更新 |
| 三语政策上线 | 网站 Deploy Worker 成功，英中日六页新增正文和日期均匿名回读通过；不是法律审查或登录/付费业务验收 |

用户已授权推送，网关范围变更已部署且匿名检查通过。网站推送先遇到 SSH 密钥拒绝及 HTTPS GitHub 500；
随后通过 GitHub Git Data API 逐文件核对 blob SHA、逐提交核对 tree SHA，并在远端未前进的前提下
以 force=false 快进 main。网站当前提交为 26eb4bb711de717a25769be95e23f3e0fbf81016，
对应政策补充及前一提交 00580ac37753bf3ec0a9d79bc5b68b5a947dab42 的四处既有日文博客内链修正；
远端树与通过生产构建的本地树完全一致。网站工作流
https://github.com/erickkkyt/BeatAPI/actions/runs/41811085940 已成功，六个政策页均回读通过，
证据保存在 /private/tmp/beatapi-chatgpt-policy-live.json（本机临时记录，不入公开 ZIP）。
网站全量首次运行 384 文件/2882 测试通过、2 项失败；
日文链接修复后与负载下超时的静态 CORS 扫描均单独复验通过，最终源码生产构建通过。
真实用例等待指定审核账户和费用上限；
仓库中的测试提示不构成本次生产付费执行授权。门户上传、送审和 Publish 仍须分别确认。

免费检查发现 web/SEO 不应被猜作 platform ID：带错误平台过滤会得不到结果，
改用自然语言 query 并去掉未确认过滤即可找到能力。Skill 已加入该恢复规则。

## 录像脚本

建议 3–5 分钟，时间是演示建议而非平台硬性限制。使用已安装的开发连接，不为录像重复创建插件。

| 片段 | 真实展示内容 |
| --- | --- |
| 身份与连接 | BeatAPI Agent Toolkit 名称、连接状态；必要时展示授权范围和日限额，不展示密码/token |
| 免费发现 | “找适合小红书 AI 视频调研的能力，展示入参和价格，不执行。” 展示 Search/Inspect 返回 |
| 调研结果 | 批准一次有限查询，展示真实来源、抽样限制；网页与 SEO 案例另存验收记录 |
| 创作任务 | 已批准图片和设置下启动一次商品视频，展示真实 task ID、轮询和结果；未完成就如实展示处理中 |
| 能力边界 | “把这个广告发布到小红书和 TikTok。” 解释不支持发布，不伪造发布成功 |

电脑操作不等于自动录屏。可用 macOS 录屏；录制前确认不会暴露账户、客户记录、密钥或无关聊天。录完先回放，再检查匿名或审核员访问权限。

## 付费边界

免费的是能力目录 Search/Inspect，不是所有查询。社媒/网页/SEO/模型/媒体执行可能扣既有余额。
不在插件里出售积分、发起充值、展示升级促销或跳转结账。余额不足应解释限制并停止。
现有余额使用方式已如实披露，但最终是否接受仍由 OpenAI 审核决定，不能保证通过。

## 本次来源

- https://developers.openai.com/plugins/deploy/submission
- https://developers.openai.com/plugins/deploy/app-review
- https://developers.openai.com/plugins/plugin-guidelines

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
