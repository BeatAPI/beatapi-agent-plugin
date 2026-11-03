# .github/workflows/
> L2 | 父级: ../AGENTS.md

成员清单
ci.yml: 执行离线 verify 并保留本地 marketplace 构建产物；公开 OAuth 联调不算在此检查中。
release.yml: v 标签发布本地 marketplace ZIP；不再附带依赖 CLI 的旧 Skill-only 提交包。
harness.yml: 在固定宿主版本矩阵中验证 Harness 包，与 OpenAI 远程发布独立。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
