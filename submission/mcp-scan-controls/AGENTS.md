# mcp-scan-controls/
> L2 | 父级: ../AGENTS.md

成员清单
audit-findings.mjs: 历史 21 项的版本绑定离线审计；后续展示规则变化会触发保真断言，不可重生成旧阶段证据；不访问网络或改变部署快照。
prepare-aggregate.mjs: 全量 988 工具的共享 instructions/说明注解单变量对照；保持所有验证约束和权限，不将极限对照冒充发布候选。
prepare-candidate.mjs: 用原公开快照和固定契约刷新展示并精简，强制核对全部约束/权限/UI 及 53 项反馈，不扩缩目录。
entry.mjs: 固定快照的 CF fetch 接线，运行期不访问正式端点。
worker.mjs: 固定匿名元数据快照的独立 MCP 诊断服务；使用官方 SDK，绝不调用网关业务工具。
worker.test.mjs: 对照矩阵、分页、UI 隔离、业务拒绝与端点边界回归。
prepare.mjs: 匿名读取正式元数据与组件，生成快照和独立诊断 ZIP；不修改正式包。
snapshot.json: prepare 生成的公开工具/组件快照，不包含账户数据。
cloudflare.config.ts: 只挂载独立 scan-controls 路径，不接管正式 MCP 或验证路由。
vite.config.mjs: 官方 CF Vite 构建入口。
package.json: 固定 SDK 和部署工具链。
package-lock.json: 独立依赖锁。
.gitignore: 排除安装、构建、快照和本机状态。
README.md: 对照边界和执行流程，不能把诊断结果当作正式送审通过。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
