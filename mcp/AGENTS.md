# mcp/
> L2 | 父级: ../AGENTS.md

成员清单
server.mjs: 由 scripts/build-mcp.mjs 生成的完整本地运行包；依赖升级后重建，不手改。
src/: stdio 协议、工具 schemas、候选审核白名单和网关执行适配，见 src/AGENTS.md。
vendor/client/: 从官方客户端同步的源码，受 generated/runtime.lock.json 校验。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
