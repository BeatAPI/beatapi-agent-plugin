# BeatBrowser for DeepSeek Harness — 浏览器连接器

连接已有登录状态的 Chrome，使用独立后台任务空间，并允许用户随时接管。

由 BeatAPI 维护的社区接入，不代表 DeepSeek 官方产品或背书。开源协议 MIT。

## 安装

需要 Node.js 22.12+、pnpm 和受支持的 Harness。兼容范围只声明已验证版本：0.1.0-rc.6、0.2.1-rc.2。

```sh
dsh plugin --profile web add @beatapi/dsh-browser@0.1.0
dsh --profile web
```

也可以通过 GitHub 安装包中的预构建 JavaScript，无需构建脚本：

```sh
dsh plugin --profile web add 'github:BeatAPI/beatapi-agent-plugin#harness-v0.1.0&path:/packages/dsh-browser'
```

Chrome 扩展需要按 https://beatapi.io/browser 单独安装并连接；插件安装不会自动安装扩展或授予权限。连接器固定使用已发布的 BeatBrowser 1.4.1。普通本地浏览器工具免费，不需要 API key；FAST/JEV 不会被本插件开启。后台任务被用户前台操作打断后，必须有这次中断之后的新明确指令才能恢复。

## 使用

Open a new background TaskSpace, read example.com and report its title; preserve my other tabs.

工具：Namespaced mcp__beatbrowser__* tools from the released BeatBrowser MCP server.

验证范围、测试版本和限制见 [验收记录](https://github.com/BeatAPI/beatapi-agent-plugin/blob/harness-v0.1.0/harness/VALIDATION.md)。[English](README.md) · [问题反馈](https://github.com/BeatAPI/beatapi-agent-plugin/issues)。
