# 临时 CF 协议诊断：部署、测试和结论

> 用户授权添加窄范围透明诊断并测试；未授权提交审核。本轮未部署网关、改 DNS、改 OAuth、缩减工具目录或更改请求校验。

## 已执行

1. CF Routes API 只读核对原来仅有 `.well-known/openai-apps-challenge` 的域名验证路由，没有 MCP 路由冲突。
2. 独立 `submission/mcp-diagnostic/` 模块先跑失败测试，再实现原请求/响应流透传；6 项确定性回归通过。覆盖原请求对象及正文不变、SSE/响应不变、秘密信息不记录、大正文/非法正文、过期旁路、错误不重试及日志失败不影响响应。
3. `cf deploy --dry-run` 通过后部署版本 `d3b77081-6f6a-4d00-80ee-4e58b3b5c3de`。只新增精确 `https://api.beatapi.io/mcp/openai` 路由，未设置通配或 Custom Domain。
4. 禁用平台自动 invocation 日志和 tracing，设置查询串脱敏，日志仅为显式白名单。正文观察最多 4 KB/500 ms，错误观察最多 1 KB/500 ms，异步 waitUntil，不阻塞响应；未知错误正文不保存。
5. 完成免费对照及隐私验证后，仅点击同一草稿 Rescan 一次。所有操作均未点击 Submit 或 Publish。
6. 保存结果后撤销诊断路由，并确认只剩原域名验证路由；正式 MCP 恢复源站直接处理。

## 上线测试

| 对照 | 结果 | 检查目的 |
| --- | --- | --- |
| 标准 initialize，Accept 含 JSON/SSE | 200，原 InitializeResult | 正常协议保持兼容 |
| 同一 initialize，Accept 只有 JSON | 400，原 Accept 错误 | 没有偷偷放宽协议 |
| 虚假 Bearer/Cookie/正文隐私标记 | 401 | 鉴权仍拒绝；检查完整平台日志确认标记未出现 |
| 无正文 POST，Accept 通配 | 400，Invalid MCP request | 复现本次捕获到的错误类别，不证明原请求正文为空 |

原域名验证路径和 `/api/status` 在诊断期间均为 200。日志中只有协议元数据，未出现虚假隐私标记，未记录真实 Authorization、Cookie、令牌或业务参数。没有运行付费业务工具。

## 捕获到的真实异常

03:26:47–03:26:56 UTC：OpenAI 主客户端的 10 次 `tools/list`、1 次 `resources/read` 和一个没有列入白名单的方法（日志标为 other）全部返回 200，使用协议版本 2026-07-28；没有去记录未知方法原文或任意业务正文。

03:26:57.086 UTC（北京时间 11:26:57），相邻的 Python 请求：

```json
{
  "ray": "a5717aa66b8a27c3",
  "method": "POST",
  "client": "Python/3.13 aiohttp/3.14.4",
  "accept": {"present": true, "json": false, "eventStream": false, "wildcard": true},
  "contentType": "other_or_missing",
  "protocolVersion": "missing",
  "rpcMethod": "unobserved",
  "protocolError": "invalid_json",
  "status": 400
}
```

`invalid_json` 是本次诊断代码对**完整匹配**源站固定错误文本 `Invalid MCP request` 的分类，不是记录的任意原始正文。结合网关 `service/beatmcp/server.go`，这是将请求解析为 MCP envelope 时失败的分支，尚未进入 SDK Accept 检查或业务执行。有效 JSON 但结构不匹配也可能触发该分支，不能把分类名称当成对原正文格式的完整证明。

**因此，原先的 Accept 假设不能解释这条捕获记录的实际拒绝分支。只补 Accept 也不足以让这条请求成为合法 MCP 调用。不应将非法 POST 伪装为 200 来迎合扫描。**

## 扫描结果与证据边界

后续独立对照已完成，见 `MCP-SCAN-CONTROLS-2026-11-08.md`：988 个最小描述符与两个真实半目录均能完成，完整真实集合带/不带 UI 均 unknown。完成的扫描同样出现 400，不能将单条 400 当成根因。

- scan ID：`asdk_app_6aed1b32cb0c81919339954cee14a350~AppsSDKContinuousScan_8dcd58434ffc81919ca8dce47883bae4`。
- attempt ID：`01a1b931-b78c-7751-b202-fb493f37e0f4`。
- `completed_at`：2026-11-08T03:27:08.078972+00:00。
- `problem.code: unknown`，active_run 为空，988 项 incomplete，无具体 findings；仍未完成。
- 主 MCP 客户端正常获取目录及组件的事实与 Python 非法 POST 可以同时成立。Python UA 的内部归属和探测目的仍未公开，不能仅凭相邻时间断言它导致 unknown。
- 若要继续缩小扫描服务、工具规模或 UI 处理问题，需要另行授权独立诊断入口/测试草稿做受控对照，或用本次 scan/attempt ID 对齐 OpenAI 内部任务原因；不能在正式端点上按扫描客户端隐藏功能。

## 回退已完成

03:29:05 UTC：精确删除本次路由 `54dd0533134840fb9fdd8ff9131e9e84`，没有删除整个区域路由表。原验证路由 `04dd926d699240c6831d72824947f1e4` 保持不变。删除后匿名 MCP initialize 200、域名验证 200。

独立 Worker 版本保留但无生产路由、无 workers.dev/预览地址；截止时间绑定只用于防止误留日志，不代替撤路由。源码未推送，所有本机证据在 `submission/artifacts/mcp-edge-trace-20261108/`，不进入公开 ZIP。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
