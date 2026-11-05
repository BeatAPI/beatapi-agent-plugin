# 私有测试版与正式展示资料

默认语言为英文，品牌名称为 BeatAPI Agent Toolkit，企业署名为 Logiavox LLC，
分类为 Productivity。英文简介、完整说明、三个开场提示、四个网站/政策链接和浅/深色
图标都来自 scripts/submission-package.mjs。中文和日文翻译来自 listing-translations.json。
测试不应维护一份缩水的中文描述，也不应使用默认拼图图标或另造固定能力清单。

## 当前截图对应的版本

2026-11-04 通过账户源码读取确认：现有 Test 是手动添加远程 MCP 生成的私有 App，
不是仓库完整 ZIP 的安装结果。更新前源码只有 App 绑定和宿主生成的兼容 manifest，
使用 Other 分类和初始中文描述。读取源码不代表允许通过归档覆盖 App 所有的展示字段。

保留该 App、OAuth 连接和用户授权。App 管理页面允许修改的字段可在那里更新；
不要用 Plugin Creator 的技能编辑接口强行覆盖 App 绑定、展示、作者或 MCP 配置。
它仅允许符合条件的 App 插件编辑技能及支持文件。不能为了图标或资料更新就删除
已连通的 App，或未经确认创建第二个插件。

私有开发连接的作者展示由宿主和创建者身份决定，不保证 package 中的 developerName
能改掉个人 By 署名。正式提交时选择已认证的 Logiavox LLC 企业身份，并读回确认。

2026-11-04 已通过 Plugin Creator 将同一私有 Test 更新为 1.0.1，加入
skills/beatapi/SKILL.md；账户读回内容与 REMOTE-SKILL.md 字节一致，原 App 绑定、
私有范围和展示配置均保留。此结果仅证明技能已保存，不代表图标/文案已改，
也不证明宿主对新技能的实际调用已验收。浏览器验证及本机电脑控制不可用，
App 展示编辑仍需在其管理界面完成，不能用本次技能更新冒充完成。

## 2026-11-05 当前浏览器账户核对

当前浏览器账户中新建并连接的开发插件为
`plugin_asdk_app_6aeb574f6f948191a37a3a5c345f0721`，App ID 为
`asdk_app_6aeb574f6f948191a37a3a5c345f0721`。设置页已显示 Connected accounts、
OAuth 和正式 MCP 地址；用户自行完成登录与授权。该对象不是前述原私有 Test，
不可把原 Test 的 1.0.1 Skill 更新当作此对象已更新。

更新前经页面 Download plugin ZIP 导出核对，此对象 1.0.0 仅有 `.app.json` 和
`.codex-plugin/plugin.json`，没有 Skill；完整英文说明和名称已由同源资料填写。
页面仍显示个人开发者、Other 分类、网站 Unavailable 和默认图标，尚未与公开包展示对齐。
当前连接器的源码读取对这个精确 ID 返回 Not found，未使用其他账户对象替代。

2026-11-05 用户要求重试后，通过 Upload new version 上传私有更新包成功。
文件选择器重新打开后，选择 visualizations 中的更新包，Open 按钮可用；
此前禁用的原因未确定，不能据此断言是 ZIP 或路径权限问题。
页面显示 New version uploaded，同一插件详情显示 Version 1.0.1、Apps 1 和 Skills 1。
随后从同一页面重新下载归档 `/Users/zeiki/Downloads/plugin (1).zip`，确认
skills/beatapi/SKILL.md 与 REMOTE-SKILL.md 字节一致，`.app.json` 内容不变，
manifest 除版本和 `skills` 声明外与更新前完全一致。未重新创建插件或更改 OAuth 配置。
本次证明技能已保存且页面已发现，不代表宿主新会话已实际加载执行该 Skill；
默认图标、Other 分类、网站和企业署名仍未对齐，也没有正式提交或付费调用。

免费宿主检查对话为 https://chatgpt.com/c/6aeb590d-be80-83ee-98fd-e9f8b277a6d8 。
请求仅允许 capabilities_search（web search，最多三项）和 capabilities_inspect。
ChatGPT 页面返回成功，目标为 data:web.search，目录价格 $0.005/request，
next 为 beatapi_data_web_search_96ea6f8641；页面可见工具活动，但未取得原始调用日志。
这只记录宿主显示的发现结果，不是付费 Web Search 执行、全部审核案例通过或账务核验。
用户设置的每日 20 美元连接限额不构成当前 Agent 的付费测试授权。

## 同源导出流程

### 2026-11-05 私信边界修复

当前浏览器的同一个开发插件已更新为 1.0.2。只修改 REMOTE-SKILL.md 的
发帖/私信/cookie 拒绝规则：不推荐或调查其他集成、不追问平台账户、不暗示 OAuth 能补足未支持能力。
上传前重新导出当前 1.0.1 为基线；1.0.2 上传后再次下载，确认 Skill 与源码字节一致，
`.app.json` 不变，manifest 仅 version 从 1.0.1 变为 1.0.2，其余所有字段和原 App/OAuth 绑定保持不变。
归档位于本机 visualizations 的 beatapi-private-update-1.0.2.zip，不是公开送审 ZIP。
源码回归已先观察失败后修复通过；实际宿主行为复验状态见 REVIEW-RUN-2026-11-05.md。

```bash
npm run submission:listing
```

输出 dist/submission/presentation/plugin.json 与其引用的全部浅/深色 PNG。
该 manifest 与公开构建器逐字段同源，含默认英文和中日文翻译，可用于核对和填写
管理界面的字段。这个目录没有 MCP 或 Skill，**不是可安装插件，也不是送审 ZIP**。
正式 ZIP 仍通过 submission:build 的 OAuth、工具与公开范围检查，不能用该导出绕过。

对于现有私有 App：先通过管理页面确认实际可编辑字段和限制，再更新同一个对象。
若宿主没有展示完整元数据的入口，应如实报告限制，不把本地导出描述成账户已更新。
若需要改为独立完整 ZIP 安装，先确认迁移方式及原连接保留方案，不能静默复制绑定。

## 1.1.0 私有更新

2026-11-05 在同一浏览器账户、同一插件 ID 更新为 1.1.0，页面显示 New version uploaded。
上传前重新下载当前 1.0.2，上传后再次下载确认：Skill 与当前 REMOTE-SKILL.md 字节一致；
`.app.json` 完全不变，manifest 仅 version 变为 1.1.0，其余字段、App ID、OAuth 连接与私有范围均保留。
私有更新归档为 visualizations 下 beatapi-private-update-1.1.0.zip，不是正式公开送审包。
新版 Skill 和服务端组件是不同发布环节：界面显示 1.1.0 不证明网关部署或内联组件已被宿主验收。

## 多语言边界

英文放在 interface 的基础字段，中日文以 zh-CN / ja-JP 写入
extensions.com.openai.publication.translations；不增加虚构的默认语言字段或 en-US 翻译。
按 OpenAI 2026-11-04 文档，翻译会被导入并保留，但目前不保证目录页和 listing API
已经按语言展示这些翻译。默认英文仍然必要；切换本地预览语言不能证明宿主多语言已生效。

Skill 要求按用户请求语言回复，同时保留工具名、reference、ID、URL、入参键和枚举值。
能力契约仍以服务端为准，不能在 Skill 中翻译参数键或复制一套模型/API schema。

来源：https://developers.openai.com/plugins/deploy/submission#translate-listing-text

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
