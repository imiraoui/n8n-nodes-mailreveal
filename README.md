# n8n-nodes-mailreveal

Use [MailReveal](https://mailreveal.com) in [n8n](https://n8n.io). Prepare tracked emails, create Gmail drafts, and read email activity signals.

This is a community integration. n8n verification has not been granted. Publication metadata is pending an operator-approved public author email; `npm run lint` deliberately blocks release until that field is configured. CI runs source lint, build, and contract tests.

## Installation

After npm publication, self-hosted n8n users can install `n8n-nodes-mailreveal` under Settings → Community Nodes. Installation on n8n Cloud requires n8n verification.

## Credentials

Create a scoped MailReveal API key in Connections → API & MCP. Set the instance URL and API key in the MailReveal API credential. Use only the scopes needed by the selected operations. Preparing does not send. Send Message requires an existing prepared message and Confirm Sending. Image loads are uncertain signals and do not prove reading.

## Operations

- **Get Many Messages**: Search and paginate tracked messages.
- **Get Message**: Read message history and tracking artifacts.
- **Prepare Message**: Create tracking HTML without sending an email.
- **Send Message**: Submit an existing prepared message once.
- **Create Gmail Draft**: Save a prepared message as a Gmail draft.
- **Get Events**: Read image-load signals; loads do not prove reading.
- **Get Connection Status**: Read Gmail and SMTP capabilities.
- **Sync Gmail**: Run bounded Sent-mail reconciliation.
- **Get Webhooks**: Read webhook endpoints without signing secrets.
- **Get Deliveries**: Read recent webhook delivery outcomes.

## Usage

Import `examples/basic.json`, select your credential if required, and run the workflow. Example document URLs are placeholders and must be replaced with a real public document you are authorized to process. Inputs and responses retain the service's identifiers, currencies, source evidence, and uncertainty fields.

For an AI Agent, import `examples/ai-agent-tool.json`, connect your chat-model credential, and select the service credential when required. The node supports **Use as AI Tool**; the example uses `$fromAI` for the main lookup input. Review tool inputs and any usage charges before executing.

No API keys, account identifiers, or private data are included in the examples. Request data goes to MailReveal; no telemetry is added. The node has no runtime dependencies and uses n8n HTTP and binary helpers.

## Development

Requires Node.js 24 for the current n8n development toolchain.

```sh
npm ci --ignore-scripts --legacy-peer-deps
npm run lint
npm run build
npm test
npm run dev
```

The package follows the official `@n8n/node-cli` starter conventions. The HTTP request builder has contract tests and execution tests with mocked HTTP helpers. Live authenticated execution and the verification recording must be completed with operator-supplied credentials.

## Publishing and verification

See [RELEASE.md](RELEASE.md). `.github/workflows/publish.yml` publishes from GitHub Actions with npm provenance. Configure the npm trusted publisher for this repository and `publish.yml`, or provide the repository's `NPM_TOKEN` secret for the first release. Publication and n8n approval are separate steps.

API documentation: [MailReveal documentation](https://mailreveal.com/api/openapi.json).

## License

MIT
