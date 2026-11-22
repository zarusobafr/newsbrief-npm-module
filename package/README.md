# newsbrief-cli

Type any genre, get the top 10 things that happened in the last 24 hours — each in 1–2 lines — right in your terminal. Uses live web search through **Google Gemini** (Google Search grounding) or **Anthropic Claude** (web search tool).

## Install

```bash
npm install -g newsbrief-cli
```

## Use

```bash
newsbrief            # or: nb
```

1. Prints a welcome line
2. First run only: asks for your API key (Gemini `AQ.…` / `AIza…` or Anthropic `sk-ant-…`). The provider is detected automatically and the key is saved to `~/.newsbrief/config.json`
3. Asks **"Which genre?"** — type anything: `sports`, `esports`, `GTA 6`, `finance`, `trade`, `world security`
4. Prints up to 10 bullets with headline, summary and source

One-shot: `newsbrief "world security"`
Other: `newsbrief --provider gemini`, `newsbrief --reset-key`, `newsbrief --help`

## Config

| Env var | Purpose |
|---|---|
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` | Use a Google key instead of the saved one |
| `ANTHROPIC_API_KEY` | Use an Anthropic key instead of the saved one |
| `NEWSBRIEF_MODEL` | Override the model (defaults: `gemini-2.5-flash`, `claude-sonnet-5-5`) |
| `NO_COLOR` | Disable colours |

Requires Node 18+.
