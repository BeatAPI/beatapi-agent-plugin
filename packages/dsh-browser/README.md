# BeatBrowser for DeepSeek Harness

Connect Harness to your existing Chrome logins through the released BeatBrowser local bridge and background TaskSpaces.

A community integration maintained by BeatAPI; not an official DeepSeek product or endorsement. MIT licensed.

## Install

Requires Node.js >=22.12, pnpm, and a supported Harness version. Compatibility is intentionally limited to the verified versions in `engines.dsh`: 0.1.0-rc.6 and 0.2.1-rc.2.

```sh
dsh plugin --profile web add @beatapi/dsh-browser@0.1.0
dsh --profile web
```

GitHub installation is also supported (prebuilt JavaScript; no prepare/build script):

```sh
dsh plugin --profile web add 'github:BeatAPI/beatapi-agent-plugin#path:/packages/dsh-browser'
```

Install the Chrome extension separately using [BeatBrowser setup](https://beatapi.io/browser). This connector pins `@beatapi/beat-browser@1.4.1`; CLI/MCP installation does not install or grant permissions to a Chrome extension. Connect your intended Chrome profile, then inspect status before starting a task.

The connector does not auto-resume an interrupted TaskSpace. A new explicit instruction from the human is required after foreground interruption. It does not export cookies or credentials to chat as a connection step.

## Try it

> Open a new background TaskSpace, read example.com and report its title; preserve my other tabs.

The bundled `beatbrowser-harness` Skill supplies the task procedure.

## Tools

Namespaced mcp__beatbrowser__* tools from the released BeatBrowser MCP server.

## Costs and boundaries

Normal local tools are free and need no account or API key. Optional FAST/JEV is not enabled or configured by this connector.

## Validation and support

See [Harness validation](https://github.com/BeatAPI/beatapi-agent-plugin/blob/main/harness/VALIDATION.md) for tested versions, exact checks and unverified boundaries. Report sanitized issues at https://github.com/BeatAPI/beatapi-agent-plugin/issues. See [privacy and security](https://github.com/BeatAPI/beatapi-agent-plugin/blob/main/harness/SECURITY.md).

[简体中文](README.zh-CN.md) · [BeatAPI](https://beatapi.io/)
