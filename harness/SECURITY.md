# Harness package privacy and security

These packages run as trusted local host code. Search and Inspect contact `https://api.beatapi.io` without credentials. Authenticated Data reads, generation and result/status calls send the key only in the Authorization header to that fixed origin; redirects are refused. There is no added telemetry service. Tool responses reach the user's chosen model and host.

Keys are resolved per operation through Harness credentials. Settings contain reference names, not secrets. Errors do not return raw gateway messages, supplier diagnostics or keys. Failed paid requests are never automatically retried.

Pricing acknowledgements bind the reference, schema hash, pricing and normalized input. Human approval is required before confirm_paid. This is a workflow check, not cryptographic proof of consent or a gateway spending cap. Host approval policies remain authoritative.

Social tools reject model/workflow/web references and account-mutation verbs. Retrieved content is untrusted. CSV output neutralizes formula prefixes; report rows separate observed evidence from analysis. Reports return contents and do not write arbitrary files.

Media starts require a stable idempotency key. Remote tasks can continue after local cancellation; resume the original task ID. The plugin does not silently resubmit failed tasks, upload local files or download arbitrary URLs.

The Browser connector starts the published `@beatapi/beat-browser@1.4.1` through the in-box MCP client. Extension installation, pairing and website login remain separate user steps. Real signed-in browser control retains TaskSpace ownership, interruption and manual-resume rules. Optional FAST is not enabled by this connector.

Harness records, model-provider processing and BeatBrowser records follow their respective policies. Use private vulnerability reporting for security issues; never attach real keys, cookies, customer data or private media to public issues.
