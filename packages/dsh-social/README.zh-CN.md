# BeatAPI Social Research — 社媒研究

研究帖子、账号与评论样本，导出保留来源的 Markdown 和 CSV 表格。

由 BeatAPI 维护的社区接入，不代表 DeepSeek 官方产品或背书。开源协议 MIT。

## 安装

需要 Node.js 22.12+、pnpm 和受支持的 Harness。兼容范围只声明已验证版本：0.1.0-rc.6、0.2.1-rc.2。

```sh
dsh plugin --profile web add @beatapi/dsh-social@0.1.0
dsh --profile web
```

也可以通过 GitHub 安装包中的预构建 JavaScript，无需构建脚本：

```sh
dsh plugin --profile web add 'github:BeatAPI/beatapi-agent-plugin#path:/packages/dsh-social'
```

将 BEATAPI_API_KEY 配置在 Harness 凭证库或启动进程的环境中。apiKeyRef 保存的是凭证名称，不是密钥。不要把 key 发到聊天或工具参数里。查询能力和 Inspect 免费；实际数据读取或生成会使用 BeatAPI 余额。付费工具默认只预览价格，取得用户确认后才携带当前 pricing_ack、confirm_paid 和稳定幂等键执行。目录价格不是任意输入的精确报价或费用上限。

## 使用

Research a topic on X or Xiaohongshu, show the planned calls and price, then prepare a source table after I approve.

工具：beat_social_search, beat_social_inspect, beat_social_read, beat_social_result, beat_social_report

社媒能力按具体 action 支持。报告保留真实来源，区分观察与分析；评论结论仅代表所读取的样本。报告工具返回 Markdown/CSV 内容，保存文件由宿主执行。插件不发帖、不操作账号。

验证范围、测试版本和限制见 [验收记录](https://github.com/BeatAPI/beatapi-agent-plugin/blob/main/harness/VALIDATION.md)。[English](README.md) · [问题反馈](https://github.com/BeatAPI/beatapi-agent-plugin/issues)。
