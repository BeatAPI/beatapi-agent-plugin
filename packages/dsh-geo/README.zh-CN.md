# BeatGEO：DeepSeek Harness SEO / GEO 工作台接入

连接已有的本机 BeatGEO，管理品牌和问题、采集 AI 回答、分析引用、整理草稿与对比复测。SEO 研究使用同一品牌页面及主产品的统一连接。由 BeatAPI 维护，不代表 DeepSeek 官方产品。

## 安装与连接

1. Harness「插件 → 添加插件」，输入 `@beatapi/dsh-geo`。社区审核和目录刷新后，也可在 dsh-market 搜索 BeatGEO 安装。
2. 先按 [BeatGEO 项目说明](https://github.com/BeatAPI/BeatGEO)启动本地产品。主产品需要 Node.js 24 和正常的本地安装；连接插件本身需要 Node.js 22.12+。插件不会替你安装数据库或启动主产品。
3. 在 BeatGEO 工作区设置创建适当权限的 **MCP API Key**，保存到 Harness 凭证库 `BEAT_GEO_MCP_TOKEN`，再重新加载插件。不要把 Key 发在聊天里。
4. 默认连接 `http://localhost:3140/api/mcp`。可在插件 url 设置里改为本机其他端口。`beatgeo_connection` 返回配置指引，连接后提供主产品实际允许的 `mcp__beatgeo__*` 工具。

也可使用 `~/.beat-geo/harness-mcp.env` 私密文件，内容为 `BEAT_GEO_MCP_TOKEN=<工作区签发的 Key>`，权限设为 600；在 keyFile 设置中指定其他绝对路径也可以。拒绝符号链接、非私密文件、远程地址和重定向。文件凭据每次请求重新读取；凭证库改动需要重新加载插件。

**MCP Key 用于授权 Agent 访问工作区；BeatAPI Key 用于数据与模型计费，是不同用途。** BeatAPI Key 仍只在 BeatGEO 的「连接设置」保存一次，不在本插件重复绑定。

可以说：**“读取我现有品牌的 AI 回答与引用证据，打开这个品牌的 SEO 研究。付费查询先预览费用，启用定期监测先问我。”**

SEO 查询目前通过同品牌的 SEO 页面交给已连接浏览器或人工执行；插件不伪造主产品不存在的 SEO MCP 工具。读写权限、品牌范围、报告和草稿均由主产品控制。安装本身不产生付费调用、不启用监测、不发布内容。

[English](README.md) · [Agent 使用指南](https://github.com/BeatAPI/BeatGEO/blob/main/docs/beat-geo/agent-workflow.md)
