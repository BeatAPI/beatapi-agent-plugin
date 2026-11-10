# 公开包准备记录

## 演示录像：已托管并验证

- 公开 URL：https://cdn.beatapi.io/plugins/beatapi-agent-toolkit/review/review-walkthrough-20261106-2f3be9e73321.mp4
- 本机来源：submission/artifacts/beatapi-review-20261106/recordings/review-walkthrough.mp4；完整原始证据与版本边界仍见 REVIEW-RUN-2026-11-06.md，不改写为同一版本的连续实测。
- 正式 beatapi-assets 桶，cdn.beatapi.io 自定义域名启用且 TLS 正常；使用内容摘要命名，不覆盖旧录像。
- 匿名 HEAD/GET 为 200，video/mp4，4,771,514 字节；匿名 Range 为 206，支持拖动播放。
- 远端完整内容 SHA256 与本机一致：2f3be9e7332160fa8a337473524caa947e75570dd3f828034192852cc34a4356。
- Ego Lite 匿名访问可播放，1920×972，397.583333 秒；播放时间推进至 14.62 秒，拖动至末段后继续推进至 391.03 秒，readyState=4，无媒体错误。
- 仅上传演示录像；私有 App 更新 ZIP、账户资料和完整证据包未公开上传。

## 正式客户端选择

已知可用开发客户端为 beatapi-chatgpt-test。后台系统设置中的 Beat MCP 客户端配置保存 Client ID、显示名称和精确 Callback URLs；这不是测试账户、API Key 或 OpenAI 企业认证。

客户端名称包含 test 不构成协议限制，也不必仅为名称新增客户端。但尚未核对现有注册和正式提交环境的回调地址，不能声称其已适用于正式审核。官方要求使用真实已注册的客户端，回调白名单须与宿主给出的地址一致；不能凭空猜测审核回调、改用服务器不支持的动态注册，或把预检通过当作用户授权通过。

用户随后明确指定正式 Client ID 为 beatapi-chatgpt，并由用户后续在后台注册。配置保存为 mcp.production.json；可按用户指定值构建待联调公开包，但匿名元数据预检不验证此客户端是否已登记。正式用户授权、回调白名单与门户连接仍待后续验收。

本轮不改后台配置、不新建插件、不进入提交门户。ZIP 即使成功生成也不代表客户端已经可用或已经送审。

## 历史构建失败：网络预检阻塞

使用 mcp.production.json、固定 chatgpt-ui-catalog.json 与上述已播放录像链接调用正式构建器；未绕过匿名 OAuth 和全量工具一致性门禁。initialize 请求连接超时，构建未产生公开 ZIP。submission:check 与 git diff --check 通过；离线通过不能替代本次失败的线上预检。恢复连通后需重新执行完整构建，不能沿用旧预检伪造新包已验证。

随后保护资源元数据匿名 GET 恢复 200；第二次构建通过前序 OAuth 元数据检查并开始工具分页，但 tools/list 第八次 RPC 连接超时（45 秒），仍未产生公开 ZIP。两次均为连接超时，不是证明客户端 ID 不合法或业务接口故障；不修改网关来绕过网络问题。

## 最新结果：线上严格校验与公开包完成

2026-11-06（北京时间）按用户要求重新构建成功。OAuth 元数据检查通过；SDK 匿名分页返回 987 个工具，固定目录逐项严格比对通过。本次成功构建的请求均首次返回，无需网络重试；只调用 initialize、notifications/initialized、tools/list 和元数据 GET，未调用业务工具或付费任务。SDK 对 MCP 端点的可选 GET 返回 405，不影响 POST 工具分页与 OAuth 检查。

- 公开 ZIP：submission/artifacts/public-package-20261106/beatapi-agent-plugin-remote.zip。
- 版本：0.4.0；Client ID：beatapi-chatgpt；不混用私有插件 1.1.1 版本号。
- ZIP SHA256：622f65b9f08080db35f5ce0fd0fe84b3e504a98ce6c4bff966e78628cbfe9186。
- 解压 CRC 检查通过；包内 manifest 与当前构建源深度一致，MCP 与 mcp.production.json 一致，Skill 和三个 PNG 与源码字节一致。
- 包内包含 5 正向、3 负向案例、公开录像链接、英/中/日展示资料及品牌图标；不含 .app.json、私有 App 绑定、本地 stdio 服务或凭证。
- 四个展示 URL 已匿名获取并检查对应内容；录像再次完整匿名 GET，摘要与已验证播放的文件一致。
- npm run verify：42 项主测试、16 项 Harness 测试通过。
- 构建调用、展示链接、录像摘要和 ZIP 检查报告保存在上述资料目录；该目录不是上传包内容。

现在已完成“录像托管”和“公开 ZIP 准备”。用户仍需在后台注册正式客户端，后续门户草稿连接时核对准确回调地址，再验证实际授权。未进入门户、未提交审核、未发布，也未修改后端。

官方依据：https://developers.openai.com/plugins/build/auth 与 https://developers.openai.com/plugins/deploy/submission。

## 域名验证：已部署并在门户确认通过

2026-11-06（北京时间）按用户批准的 CF CLI 方案部署独立 Worker beatapi-openai-domain-verification。Cloudflare 实时 zone 结果确认域名属于 Twu287478 账号（8529f0937781e0e44cb0075dc64c46e2），zone 为 0c964da9b4b3786fb24fceef26f66c1a。没有使用 DNS TXT，也没有修改 api.beatapi.io 的既有代理 A 记录；部署后已逐字段确认记录 ID、源站地址、代理状态和修改时间均未改变。

唯一 Route 为 https://api.beatapi.io/.well-known/openai-apps-challenge，不含通配符或整域 Custom Domain。关闭 workers.dev 与预览 URL；Worker 无绑定、无源站请求，仅 GET/HEAD 返回公开 Token，其他路径和方法拒绝。业务网站和网关均未重新部署。

- 源码与固定版本部署配置位于 domain-verification/；5 项本地测试及 cf deploy --dry-run 通过。
- 部署后重新运行完整 npm run verify，42 项主测试与 16 项 Harness 测试全部通过；公开 ZIP 摘要仍为 622f65b9f08080db35f5ce0fd0fe84b3e504a98ce6c4bff966e78628cbfe9186，无需因边缘验证设施重新上传插件包。
- CF 部署版本：0b3b17e1-1bdb-4c8b-aa1b-c3b83a662d1a。
- 公开 GET/HEAD 均为 200，Content-Type 为 text/plain; charset=utf-8，Cache-Control 为 no-store，正文与正式门户 Token 逐字一致。
- 部署前后 MCP initialize 结果及 OAuth 保护资源元数据完全一致。第一次复验 initialize 连接超时；重新执行完整复验全部通过，不把第一次超时当作服务端逻辑故障。
- Chrome 正式草稿同一 MCP 面板已独立观察到绿色 Domain verified。该次浏览器操作仅观察，未代点 Connect 或进行授权。
- 面板同时显示 Authorization required / 等待授权，不能声称正式 OAuth 或工具扫描已通过；没有提交审核或发布。

完整基线与线上检查报告位于 artifacts/public-package-20261106/domain-baseline.json 和 domain-deployment-verification.json。独立运维模块不会进入已生成的公开插件 ZIP；回滚边界见 domain-verification/README.md。

## 门户上传尝试：已跳转，内容待回读

用户确认使用 Chrome 当前正式账号的 Personal Organization / Default project，并展示 Business Approved；未据此推断门户最终发布署名已是 Logiavox LLC。

用户打开系统文件选择器后，选择本记录的正式远程 ZIP（77 KB），界面确认文件名 beatapi-agent-plugin-remote.zip 并显示 Uploading。随后后台跳转到新地址：

https://platform.openai.com/plugins/manage/plugin_asdk_app_6aed1b32cb0c81919339954cee14a350?tab=details&version=appsub_6aed1b32cb488191a9700600724d1b1e

上传后原界面仍停留 Uploading；等待后仅刷新该新地址一次，详情页持续空白。尚未读回保存的版本、发布身份、Skill/MCP 清单、自动检查或回调地址，不能把地址生成等同于完整草稿验收。后续先恢复并核验此地址，不重复创建或上传新插件。没有点击 Submit for review、填写法律声明、连接正式 OAuth 或发布。

## 最新门户只读核对：授权通过，送审仍有待办

用户确认已授权后，在 ego lite 原 Space 1、同一正式插件 plugin_asdk_app_6aed1b32cb0c81919339954cee14a350 核对，没有新建 App、重连、触发业务测试、保存表单或提交审核。

已观察到 Authentication = Authorized、Domain verified；Metadata & Skills 为 0.4.0 Draft，Developer 显示 Logiavox LLC，beatapi Skill 为 Checks passed。四个展示链接与准备包一致；审核信息已导入 5 正向与 3 负向案例，所有支持国家、中日翻译和正确的公开录像 URL。此次确认了案例数量及首个案例字段，不冒充逐条重新运行。

待办与实测界面提示：

1. MCP 配置仍是 Configuration incomplete。Findings 显示 Account connected. No scan has finished since this connection，同时提示上次扫描未完成、当前展示为历史结果；不能以工具表存在或 Authorized 代替新连接后的扫描通过。
2. Review information 的唯一缺失分组为 Reviewer credentials。当前 Login URL、Tenant、Username、Password、Sign-in steps 均未填写；凭证只能在安全表单中填写，本记录不保存凭证。
3. 两项 non-blocking metadata findings：描述应去除价格、订阅与促销内容；所选分类需要核对与主用途是否一致。Productivity 是有效类目，此处并非断言枚举格式错误。后续只调整公开描述，不删除 Skill 或政策中必要的费用披露。
4. 已导入的 release notes 为长篇历史准备日志，仍写正式客户端注册/授权 pending，已与当前 Authorized 不符；门户明确此字段会面向插件用户展示，需改成简明、准确的发布说明后重建同一插件包更新，不应原样公开内部准备记录。
5. 仍需对正式保存版本完成最终用例验收；已有私有安装测试证据不能冒充该版本验收。法律/政策声明由授权发布人确认。

当前 Review status = Not submitted，Publication = Not published。关闭只读查看的审核信息对话框，未点 Save details；保留原草稿标签给用户继续操作。

## 同一草稿文案修订与本轮 MCP 扫描结果

用户明确授权修正文案/发布说明、更新同一草稿并运行一次 MCP 扫描，审核员资料后填，禁止提交审核。保留原插件 ID plugin_asdk_app_6aed1b32cb0c81919339954cee14a350、草稿 appsub_6aed1b32cb488191a9700600724d1b1e 和未发布版本 0.4.0，没有创建新插件或改动业务后端。

公开分类改为 Data & Analytics，并用市场/内容研究说明主要用途；英中日描述和开场提示去除价格或免费宣称。必要的费用、已有余额和拒绝购买边界仍留在未修改的 Skill、审核商业声明及既有政策中。公开 release notes 改为简明的产品功能说明，不再包含私有测试版本、准备日志或过时的 pending 授权状态。新增回归先失败再通过；完整 verify 为 43 主测试 + 16 Harness 测试通过。

修订包位于 artifacts/public-package-20261106-listing/beatapi-agent-plugin-remote.zip，SHA256 为 c1f43efecbea0bab2cf2377349ba55e54c862479465e47ab6f1ab3a280042d88；构建前 OAuth 元数据与 987 个线上工具严格比对通过。与前一个 ZIP 逐文件比较，仅 plugin.json 改变；MCP、Skill、5+3 案例、录像链接、地区、图标和 LICENSE 均保持不变。

通过原草稿 Upload new version → Reupload draft 上传一次。上传后最初出现旧缓存与临时 No skills 状态，没有据此认定成功或再次上传；刷新同一保存地址后完整回读确认新描述、Data & Analytics、Skill Checks passed 与 Metadata No findings。原价格/类目提示均消失。审核信息中的中日描述与当前源码逐字一致，新发布说明与源码一致，5 正向/3 负向、原录像 URL 与所有支持国家仍在；Reviewer credentials 仍缺失且未填写或保存。

随后只点击一次 Rescan。待按钮恢复、刷新同一草稿并等待扫描状态加载完成后，门户仍显示：

> The latest scan did not complete. Try rescanning. Results are from the last available review, not this failed attempt.

正式账户仍 Authorized、Domain verified；MCP 配置仍 Configuration incomplete，诊断下载按钮不可用。不能把本地匿名严格比对通过等同于门户扫描通过，也不能仅凭通用失败提示断言是网关、账户或 OpenAI 某一方的故障。本轮未盲目重复扫描、未重连、未运行付费任务、未填写法律声明、未提交审核或发布。

该目录保留 portal-before.json、portal-package-readback.json、portal-scan-start.json、portal-scan-result.json 与 portal-scan-result.png。下一阶段仍需处理门户扫描未完成，审核员资料由用户后续在安全字段填写。原草稿标签已保留给用户。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
