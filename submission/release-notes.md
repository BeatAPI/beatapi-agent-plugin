# BeatAPI Remote Plugin preparation

Prepare a portable remote MCP + Skill package while preserving the existing
plugin identity and local marketplace installations. The remote Skill uses the
host OAuth connection only; it does not require local software or key entry.

The remote Skill now covers social/web research, text and decision models,
image/video generation and media workflows through Search, Inspect and exposed
execution operations. Social data is read/research-only. The existing local
generic capability tools remain compatible.

Independent public execution schemas and fixed-reference bindings can be compiled
from the real gateway catalog. The dispatcher validates inputs and the next adapter
does not walk untrusted content. The gateway bridge and frontend have shipped
with remote OAuth/MCP disabled; production activation and real host acceptance
remain outstanding. Generic public execution, local uploads and administration are excluded.

Public packaging requires a real deployed OAuth endpoint and passes a read-only
discovery and SDK tool-inventory comparison before emitting a ZIP. The pinned
v2 catalog retains OAuth declarations in SDK-visible metadata and binds each
operation to its reference/schema hash. Missing tools, schema or policy drift
prevent packaging; OAuth-only diagnostics cannot bypass that check.
Actual user authorization, live tool
behavior, review cases and demo remain unverified. This preparation is not a
published release or a completed review submission.
