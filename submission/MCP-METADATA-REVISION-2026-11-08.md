# 命名、说明与无损元数据精简复验

> 2026-11-08。本轮只修改插件仓库本地源码和独立诊断 Worker/草稿。未修改正式 `/mcp/openai`、正式插件草稿、网关、OAuth、DNS 或计费；未提交审核、未发布、未推送 Git，未调用付费业务工具。

## 结果摘要

1. 原 53 个工具的命名/说明反馈经过两轮本地修订，在独立 53 工具扫描中全部完成检查，名称不清/说明不清反馈为 0。
2. 完整候选保留 988 个工具，全部输入/输出约束、默认值、固定 reference、schemaHash、权限、风险标记和原 HTML/UI 绑定逐项不变。元数据从 2,083,018 降到 1,835,059 字节，减少 11.90%。
3. 完整 988 工具最终候选在干净独立草稿中仍返回 `problem.code: unknown`，988 项 incomplete。因此本轮解决了已知展示问题，但没有解决或冒称通过全量扫描。
4. 临时路由已撤销，正式 initialize 和域名验证复验均为 200，诊断入口为 404。

## 核心实现

- `scripts/remote-presentation.mjs` 将领域展示与执行契约分离。数据操作按稳定 reference 维护已核实的语义词典，不从缩写猜用途；模型按契约类别生成“动作 + 模型”的名称及用途说明，不维护逐模型执行分支。
- 模型输入说明只来自类别与实际字段，避免“generation capability”式空泛描述。计费、用户已选参数、条件/继承设置、不得偷偷切模式、幂等重试边界仍保留。
- TTWID、请求签名、SDK header 等明确说明是技术工具，不包装为普通社媒研究，也不暗示登录账户或直接返回社交内容。保留这些既有能力不等于确认其符合公开目录政策，通用 further-review findings 仍需独立处理。
- `scripts/remote-metadata.mjs` 提供展示刷新和紧凑投影。展示刷新核对 source contract 的 schemaHash，版本不匹配即停止，不拿新契约描述旧参数。紧凑投影只删除 Schema 例子、注释及重复的通用输出说明；保留全部输入说明、默认值和所有验证关键字。
- `schemaAssertions` 只在 Schema 节点剥离注解，不遍历 default、const、enum 等业务值。required、enum、pattern、上下界、allOf/if/then、additionalProperties、x-beatapi-rules 等逐项深度相等；不以抽样验证代替全目录比较。
- `build-remote-catalog.mjs --compact` 为显式构建选项，现有非紧凑构建保留有效例子。发布预检允许输出说明精简，但仍严格核对输出契约约束和真实服务器工具内容。
- 图片审核案例及包测试同步使用新的 Nano Banana 2 工具名称；历史实测和录像证据未重写。本轮未重跑付费案例或录屏。

## 无损边界与名称迁移

原契约快照中有新的模型和历史结果枚举差异，因此本轮不把另一份全量重建目录直接替换成线上基线。候选以此前公开的 988 个描述符为基线，只刷新展示字段并精简注解，任务/结果读取工具的旧枚举保持原样。

首次只改原先被标记的 25 个技术名称，复验发现原本仅报说明问题的 27 个工具又被标记名称不清。随后统一模型动作命名，而不是继续逐个模型打补丁。

最终共有 112 个技术名称变化，其中原 53 项中有 52 项改名。全部旧名/新名/reference 在 `all-tool-renames.json`，其余能力和固定执行引用不变。名称是接口的一部分，因此未来正式上线前必须处理已安装连接/已发布元数据的旧名兼容或版本迁移，不能仅凭 reference 不变就直接部署。当前正式连接不受影响。

## 本地回归与实端验收

- `npm run verify` 通过：52 个主测试、16 个 Harness 测试，包括 Schema、stdio、UI、发布检查和案例工具名接线。
- 新增元数据回归覆盖：命名唯一/长度/调度引用、类别驱动未来模型、契约版本漂移拒绝、运行时补入的风险标记保留、历史结果枚举不变、例子字段不误删、默认值/条件约束不变及相同请求的接受/拒绝结果一致。
- 独立 Worker 4 项回归通过；每个部署版本均先 dry-run。
- 浏览器同源匿名 fetch（credentials omitted）读取全部 10 页，988 个描述符与候选逐项相等；resources/list/read 和原 HTML 逐项相等。CLI 读取曾遇到 TLS 连接超时，未将网络失败冒充元数据检查成功。
- 最终完整候选 SHA-256：`06af13c8ee4d78cd4c7c6be673329b96bc7e52ae2b1cab0f007b83116dc86a04`。
- 原组件 SHA-256：`d3388a89f4d04b72bd39b7ef8409b918facabac0efcef7dac8ccd5eec5936eb1`，内容/CSP/独立域未变。

## 独立扫描结果

独立草稿为 `plugin_asdk_app_6af04252daf48191b4656176b44669c1`，仅供本轮元数据诊断，不能作为正式送审插件。

| 检查 | 完成时间 UTC | 结果 |
| --- | --- | --- |
| 第一版完整目录，原矩阵草稿 | 09:33:37 | unknown；接口还包含 10 条旧名记录，真实服务器仍为 988 工具 |
| 第一版完整目录，干净独立草稿 | 09:40:27 | unknown，988 incomplete；排除旧名历史状态干扰 |
| 第一版 53 项反馈子集 | 09:46:13 | 53 complete，说明问题消失，但出现 27 条名称问题 |
| 最终版 53 项反馈子集 | 09:54:38 | 53 complete，名称/说明问题 0；不等于所有政策审核通过 |
| 最终版完整 988 工具 | 09:57:09 | unknown，988 incomplete |

53 项子集只是诊断对照，不是用小目录替代正式完整能力。最终候选和本地生成快照均已恢复为 988 个工具。

最终 53 项复验：

- scan：`asdk_app_6af04252daf48191b4656176b44669c1~AppsSDKContinuousScan_4b709575094c819180e6551510bd9ba6`。
- attempt：`01a1ba94-3713-7277-a2eb-065e75aa6dda`，problem 为空、active_run 为空，53 complete。

最终全量复验：

- scan：`asdk_app_6af04252daf48191b4656176b44669c1~AppsSDKContinuousScan_9ebb801efac081918009fce0f3a4af1d`。
- attempt：`01a1ba96-c9bc-7520-8990-7065c8894d53`，problem 为 unknown、active_run 为空。
- 状态查询响应 request ID：`req_33c2382c0067482db6cf97af0a7902fd`。这是读取状态的请求，不是不可见的内部失败请求。
- Worker 版本：`3f133e76-150f-4fc8-8f76-f95383204816`。该窗口 10 页 tools/list 与 resources/read 全部 200；未看到这条主链路返回 5xx。

这仍不构成“已证明 OpenAI 存在 2 MB 硬限制”，也不能把 generic unknown 解释成具体的 Schema 违规。说明精简和已知反馈修复不足以让完整目录完成扫描，仍缺内部批量检查异常原因。

## 清理与影响

09:59:06.244 UTC 精确删除本轮 `https://api.beatapi.io/mcp/scan-controls/*` 路由 `154dd2a9eb7045e0971b1bd2c4e1fee1`。原域名验证路由 `04dd926d699240c6831d72824947f1e4` 保留；没有修改正式 MCP 路由、DNS 或安全规则。

独立 Worker 的版本/日志保留但无公共路由、workers.dev 或预览入口。后续匿名复验：正式 initialize 200、域名验证 200、诊断入口 404。网关工作树未改，没有后端提交/部署。

完整证据在 `submission/artifacts/mcp-metadata-revision-20261108/`，第一轮以 `v1-` 前缀保留，最终候选、53 项逐项变化、112 项名称迁移、完整本地验证、独立端点验收和扫描原始响应均单独保存，不进入正式 ZIP。

## 后续限制

当前不能提交审核，也不能宣称全量扫描通过。本地修订可继续审查；若再做更深的元数据精简，应保持本轮全目录断言和独立扫描门禁，不删能力、不放宽参数、不将非法请求伪装成成功，也不按扫描器身份隐藏工具。

命名依据参考 [OpenAI 元数据指南](https://developers.openai.com/plugins/guides/optimize-metadata)：动作/领域和真实用途优先。完整目录 unknown 的剩余问题可用本轮干净草稿及 scan/attempt ID 继续追踪，不能仅凭字段看起来更短就归因或宣称修复。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
