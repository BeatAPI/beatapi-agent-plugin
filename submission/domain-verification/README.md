# OpenAI 域名验证

独立边缘静态响应，仅处理 `https://api.beatapi.io/.well-known/openai-apps-challenge`。Token 是正式门户展示、需要公开提供的所有权证明，不是 API Key、OAuth secret 或用户凭证。更换 Token 前必须核对同一域名是否已有其他插件使用，不能静默覆盖。

已实时确认账号为 `8529f0937781e0e44cb0075dc64c46e2`，zone 为 `0c964da9b4b3786fb24fceef26f66c1a`；api 的现有代理 DNS 保持不变。2026-11-06 部署前该地址返回源站 nginx 404。

## 发布

本目录运行 `npm ci`、`npm test`、`npm run deploy:check`，核对构建产物只包含精确路由后再运行 `npm run deploy`。使用独立 Worker 名称，不发布业务网关或网站，不添加 Custom Domain 或任何通配路由。

部署后匿名 GET 必须返回 200、text/plain，正文逐字等于门户 Token；同时检查原 MCP initialize 与 OAuth 元数据仍正常。端点成功不等于门户已 Verify Domain，也不等于 OAuth 连接或正式审核完成。

## 回滚

只移除该 Worker 的精确验证 Route，再删除这个独立 Worker；不修改 api DNS 或任何已有 Worker。不得通过部署空路由表的方式清空整个 zone。移除后该地址恢复原有源站处理；其余接口不经此 Worker。审核可能复验，正常情况下保留验证响应。

2026-11-06 已部署版本 0b3b17e1-1bdb-4c8b-aa1b-c3b83a662d1a，匿名 GET/HEAD 和部署前后 MCP/OAuth 元数据复验通过；Chrome 正式门户已显示绿色 Domain verified。正式 OAuth 仍等待授权，不代表已送审。完整记录见 ../PACKAGE-PREP-2026-11-06.md。
