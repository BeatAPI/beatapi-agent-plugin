# domain-verification/
> L2 | 父级: ../AGENTS.md

成员清单
worker.mjs: 单地址公开所有权证明；仅 GET/HEAD 返回固定 Token，无账户、存储或源站访问能力。
worker.test.mjs: 验证精确地址、纯文本、HEAD 和拒绝其他路径/写请求的边界。
cloudflare.config.ts: 锁定已核对的账号和唯一 HTTPS 路由；关闭 workers.dev 与预览地址，不配置整域 Custom Domain。
vite.config.mjs: 官方 Cloudflare Vite 构建接线，与业务网站及网关发布隔离。
package.json: 独立固定版本部署工具及测试命令，不进入公开插件 ZIP。
package-lock.json: 独立部署依赖锁。
.gitignore: 忽略本机依赖和 Cloudflare/Vite 编译产物。
README.md: 账号、部署、回滚与正式验证状态的运维边界。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
