# Metadata Discovery Tools: Review Clarification

Draft supporting note only. No appeal or review submission has been made.

Evidence baseline: gateway commit d3c92a9ad3916dd61d521d57c22cef5503e4d1c0. The formal scan completed at 2026-11-09 10:15:09 UTC (attempt 01a1bfca-7eda-7727-b226-c7dacc0f5cfd) and retained both needs_investigation findings. An earlier independent full-catalog scan did not flag them. This difference does not establish platform acceptance or an exemption; the clarification below rests on implementation and regression evidence.

A subsequent independent full-catalog scan completed at 2026-11-09 11:40:13 UTC (attempt 01a1c017-ec54-7d8c-8d5c-5fdb0b6564cd). Both discovery tools completed with no findings. The unchanged discovery definitions remain supported by the implementation evidence below; the formal draft has not been rescanned or updated by this diagnostic run.

Earlier formal evidence: gateway commit 1dcbae3a8e7eb3d36c4b90f692922c947daeeb1b, scan completed at 2026-11-09 12:05:25 UTC (attempt 01a1c02f-349f-7e10-9866-067d7f183666). Neither discovery tool had the hidden-execution allegation in that attempt. Each still had a generic further-review notice with a needs_investigation decision; this was not publication approval.

Latest formal evidence: gateway commit ffe8fbb7b36d64205cd6c61b40dbaceae4b1adb0, completed at 2026-11-09 15:04:44 UTC (attempt 01a1c0d2-81c7-7e19-ba46-ca5702b1a112). All 986 tool definitions completed scanning. Both discovery tools again received the undisclosed-execution allegation, now with decision fail, while their definitions were unchanged. The six repaired ranking-name allegations disappeared. The catalog also has 485 generic further-review reasons (279 fail and 206 needs_investigation). These statuses are not approval and have not been appealed or submitted for review. The explanation below concerns the two discovery findings only; it does not resolve the generic decisions.

The findings for capabilities_search and capabilities_inspect appear to classify metadata discovery as execution of undisclosed operations. Neither tool can start a model, data request or workflow.

- Search accepts only catalog-query fields. Inspect accepts a capability reference. Both schemas reject additional properties, including execution inputs, operation selectors, model selectors and idempotency keys.
- The protocol adapter assigns only the search or inspect action. Their handlers read the published registry; the execution/account submission chain belongs to the separate run route.
- The discovery registry contains only references backed by the published fixed bindings. The catalog exposes 982 separate execution tools, plus two authenticated task/result readers and these two discovery tools, for 986 tools in total.
- Inspect may return a suggested next call with pricing and parameter metadata. Returning that suggestion does not execute it; execution requires a separate call to the advertised fixed tool with its own input schema and authorization.
- Both discovery tools declare read-only, non-destructive annotations and no-auth access. These declarations match their implementation rather than granting access to model execution.

An isolated official-SDK regression verifies anonymous search and inspect routing and rejects ten attempts to add execution fields before the adapter callback runs. Existing tests also check that unpublished registry entries are filtered out. These are local regression results, not new paid production executions.

Please assess these as metadata lookup operations rather than generic execution multiplexers. This clarification addresses only the two discovery-tool findings, not other findings or overall approval.

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
