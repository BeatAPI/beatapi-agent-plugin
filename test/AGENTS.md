# test/
> L2 | 父级: ../AGENTS.md

成员清单
remote-metadata.test.mjs: 公开范围投影与保真；覆盖 Bilibili 榜/期数技术名、Douyin 四类榜单分页/开放整数/嵌套可空标签、Instagram 搜索游标/默认及星图/媒体边界，不增加参数约束。
chatgpt-ui.test.mjs: 契约驱动的参数确认/继承约束、新模型无分支回归、组件接线、安全投影及只读刷新；不调用付费服务。
plugin.test.ts: 本地工具 schemas、风险标记、宿主 manifest 与凭证安全回归。
mcp-e2e.test.ts: mock 网关上的真实 stdio 协议与 CLI 桥接；不调用付费服务。
latest-tools.test.ts: 本地工具与同步 Skill 的能力一致性。
submission.test.mjs: 展示/ZIP 同源及精确文件白名单，隔离内部来源与审核证据；覆盖 Schema、秘密字段排除、同源导出及 SDK 只读扫描，mock 不代表宿主通过。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
