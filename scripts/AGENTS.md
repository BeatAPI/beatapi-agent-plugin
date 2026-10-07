# scripts/
> L2 | 父级: ../AGENTS.md

成员清单
build-mcp.mjs: 将本地 MCP 编译为单一可安装 Node ESM，check 模式验证提交产物一致性。
build-marketplace.mjs: 构建跨宿主本地 marketplace，不用于 OpenAI 公开提交。
build-submission.mjs: 构建具备品牌和 metadata 的独立 Skill 草稿包，明确保留 CLI 依赖阻塞。
contract.mjs: 同步和校验官方 OpenAPI 快照及锁文件。
sync-runtime.mjs: 同步官方 CLI 客户端源码，校验 vendor 锁。
sync-skill.mjs: 同步 canonical Skill，校验内容锁。
validate-cursor.mjs: 验证 Cursor 宿主 manifest 和变量边界。
validate-grok.mjs: 验证 Grok 宿主 manifest 和接线。
submission-package.mjs: 生成并校验公开草稿 manifest，隔离本地 MCP 与公共 metadata。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
