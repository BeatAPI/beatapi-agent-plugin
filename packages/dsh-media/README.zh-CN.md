# BeatAPI Media Kit — 图片视频工具

查询图片视频模型、参数与价格，确认后生成，并通过原任务 ID 续查结果。

由 BeatAPI 维护的社区接入，不代表 DeepSeek 官方产品或背书。开源协议 MIT。

## 安装

需要 Node.js 22.12+、pnpm 和受支持的 Harness。兼容范围只声明已验证版本：0.1.0-rc.6、0.2.1-rc.2。

```sh
dsh plugin --profile web add @beatapi/dsh-media@0.1.0
dsh --profile web
```

也可以通过 GitHub 安装包中的预构建 JavaScript，无需构建脚本：

```sh
dsh plugin --profile web add 'github:BeatAPI/beatapi-agent-plugin#path:/packages/dsh-media'
```

将 BEATAPI_API_KEY 配置在 Harness 凭证库或启动进程的环境中。apiKeyRef 保存的是凭证名称，不是密钥。不要把 key 发到聊天或工具参数里。查询能力和 Inspect 免费；实际数据读取或生成会使用 BeatAPI 余额。付费工具默认只预览价格，取得用户确认后才携带当前 pricing_ack、confirm_paid 和稳定幂等键执行。目录价格不是任意输入的精确报价或费用上限。

## 使用

Find an image model for a product cover; show its supported inputs and pricing before generating anything.

工具：beat_media_search, beat_media_inspect, beat_media_generate, beat_media_status

先 Inspect 参数与参考素材要求。生成提交与生成成功分开报告，超时后用原 task_id 继续查询，不重新创建付费任务。插件不负责上传本地文件或完整时间线剪辑。

验证范围、测试版本和限制见 [验收记录](https://github.com/BeatAPI/beatapi-agent-plugin/blob/main/harness/VALIDATION.md)。[English](README.md) · [问题反馈](https://github.com/BeatAPI/beatapi-agent-plugin/issues)。
