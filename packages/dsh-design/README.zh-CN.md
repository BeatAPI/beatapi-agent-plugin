# BeatDesign：DeepSeek Harness 本地创作工作台

让 Harness 与你操作同一个项目、画布、素材库和视频时间线。由 BeatAPI 维护的社区接入，不代表 DeepSeek 官方产品。

## 安装

Harness 左侧「插件」→「添加插件」，输入 `@beatapi/dsh-design`。社区审核并刷新目录后，也可在 dsh-market 搜索 BeatDesign 点击安装。提交不等于审核通过。

需要 Node.js 22.12+；不限制 Harness 版本。启用后，插件调用已发布的 BeatDesign 0.2.5 运行包，在本机 http://127.0.0.1:3020 启动工作台，并提供 30 个 MCP 工具。首次启动会创建本地存储并运行运行包内的数据库迁移。

可以说：**“帮我新建一个商品视频项目，打开画布，整理我提供的素材。任何付费生成先问我。”**

本地项目整理和剪辑不需要 API Key。需要图片视频生成或分析时，在 BeatDesign 的连接设置中配置自己的 Key；确认后才调用远程服务、使用余额。安装和启动本身不上传素材。

## 注意

项目保存在插件目录之外的本机应用数据目录。可在插件设置的 dataDirectory 选择绝对路径。3020 端口固定；如已打开另一个 BeatDesign，请先自行停止该连接，再启用本插件，避免同时启动。重新安装不应删除项目数据。

节点端抽帧需要 ffmpeg，MCP 时间线导出还需要 ffprobe；浏览器导出不要求系统 FFmpeg。Agent 应保留版本、幂等键和素材归属，并打开工具返回的项目链接供你检查。

[English](README.md) · [产品源码](https://github.com/BeatAPI/BeatDesign)
