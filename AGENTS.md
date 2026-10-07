# BeatAPI Agent Plugin - 独立跨宿主插件与公开发布准备
Node.js + TypeScript + MCP SDK + locked BeatAPI contract

本仓库只维护插件与本地 MCP。账户、授权、计费和托管服务属于 BeatAPI 网关；不在插件中实现第二套业务后端。

## 目录地图
- `mcp/`: 本地 stdio 服务、八工具媒体审核候选 profile 与同步客户端；`mcp/server.mjs` 为构建产物，不是托管服务。
- `skills/`: 从 beatapi-skill 同步的安装目录，禁止直接修改。
- `scripts/`: 契约同步、宿主校验与发布包构建，见 scripts/AGENTS.md。
- `test/`: 本地工具、安全边界与包结构测试，见 test/AGENTS.md。
- `submission/`: 公开提交准备与审核案例草稿，见 submission/AGENTS.md。
- `assets/`: 品牌图标与 README 图片。
- `contract/`, `generated/`: 上游接口快照及同步锁。
- `.codex-plugin/`, `.cursor-plugin/`, `.grok-plugin/`: 本地宿主兼容 manifest，不等于公开上架包。
- `.github/workflows/`: CI 与标签发布；构建成功不代表上架通过。

## 协作约束
先读 CONTRIBUTING.md。禁止直接修改 vendor 客户端与同步 Skill。公开包不得夹带本地 stdio 配置、私有 App 绑定、依赖目录或凭证。CLI 依赖的 Skill 包只是草稿，不能标记为公开提交就绪。

验证：`npm run verify`；依赖升级后重建 MCP 并检查 `npm audit`。真实付费调用、部署、提交审核及发布都需要用户授权；测试不得使用客户数据。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
