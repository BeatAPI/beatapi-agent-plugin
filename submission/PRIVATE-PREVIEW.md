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

## 同源导出

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

## 多语言边界

英文放在 interface 的基础字段，中日文以 zh-CN / ja-JP 写入
extensions.com.openai.publication.translations；不增加虚构的默认语言字段或 en-US 翻译。
按 OpenAI 2026-11-04 文档，翻译会被导入并保留，但目前不保证目录页和 listing API
已经按语言展示这些翻译。默认英文仍然必要；切换本地预览语言不能证明宿主多语言已生效。

Skill 要求按用户请求语言回复，同时保留工具名、reference、ID、URL、入参键和枚举值。
能力契约仍以服务端为准，不能在 Skill 中翻译参数键或复制一套模型/API schema。

来源：https://developers.openai.com/plugins/deploy/submission#translate-listing-text

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
