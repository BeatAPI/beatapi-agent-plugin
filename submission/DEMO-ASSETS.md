# 审核演示素材

## 演示商品

名称：Demo Bottle。虚构、无品牌的绿色水瓶，仅用于插件审核演示，不是真实商品销售页。
图片由本次任务的内置图像生成工具于 2026-11-04 生成，未使用第三方商品照片或商标。
不要据图编造容量、保温时长、防漏、环保或其他未经验证的性能声明。

公开图片直链：
https://cdn.beatapi.io/plugins/beatapi-agent-toolkit/review/demo-water-bottle-0f30a2af4bf6.png

这是图片本身的 HTTPS URL，不是商品购买链接，不要求用户登录，也不含临时签名或凭证。
审核员和媒体工作流可以直接读取它；本地文件路径不能替代这个 URL。

## 文件与验证

| 字段 | 值 |
| --- | --- |
| 仓库源文件 | assets/demo-water-bottle-v1.png |
| 格式 / 尺寸 | PNG / 1254 × 1254 |
| 大小 | 1269075 bytes |
| SHA-256 | 0f30a2af4bf6007d708537f340f5108ebf93625f3c0f530927940b54deb12922 |
| 存储 | beatapi-assets，plugins/beatapi-agent-toolkit/review/ 前缀 |
| 域名 | 已通过 CF CLI 核对 cdn.beatapi.io 绑定该桶且启用 |
| 公开回读 | 2026-11-04，无 Authorization 的 GET 返回 200、image/png，文件摘要与本地一致 |

图片保存在正式品牌素材桶，而不是临时生成结果桶。不要在审核期间删除或覆盖。
如需更换，使用新版本对象名，更新审核案例，再验证公开读取和内容摘要。
素材无需放进运行时 ZIP；审核案例已含公开 URL，源文件留在仓库供追溯。

## 演示操作

使用 test-cases.json 第 5 个正向案例的完整提示词。先展示已 Inspect 的设置和价格，
等待批准后才执行一次任务。这份素材的完成不代表视频已生成，也不代表审核案例已通过。
实际录像必须展示真实工具调用、任务状态及可用结果，不能把参考图当作生成结果。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
