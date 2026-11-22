# newsbrief-cli

Type any genre, get the top 10 things that happened in the last 24 hours — each in 1–2 lines — right in your terminal. **Works with almost any AI API key.**

## Install

```bash
npm install -g newsbrief-cli
```

## Use

```bash
newsbrief            # or: nb
```

1. Prints a welcome line
2. First run only: paste your API key. The provider is detected from the key format and saved to `~/.newsbrief/config.json`
3. Asks **"Which genre?"** — type anything: `sports`, `esports`, `GTA 6`, `finance`, `trade`, `world security`
4. Prints up to 10 bullets with headline, summary and source

One-shot: `newsbrief "world security"`

## Supported keys

| Provider | Key looks like | How news is found |
|---|---|---|
| Google Gemini | `AQ.…` / `AIza…` | Built-in Google Search |
| Anthropic | `sk-ant-…` | Built-in web search |
| OpenAI, OpenRouter, Groq, Perplexity, xAI, DeepSeek, Mistral, Together | `sk-…`, `sk-or-…`, `gsk_…`, `pplx-…`, `xai-…`… | Fresh Google News headlines (no key needed), summarised by your model |
| Custom (Ollama, LM Studio, vLLM…) | anything | Same as above, via `--base-url` + `--model` |

If the key format isn't recognised (e.g. DeepSeek/Mistral/Together), you'll be asked which provider it is, or pass `--provider deepseek`.

## Flags & env

| | |
|---|---|
| `--provider <name>` | Force a provider |
| `--model <name>` | Use a specific model |
| `--base-url <url>` | Custom OpenAI-compatible endpoint |
| `--reset-key` | Forget the saved key |
| `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, `GROQ_API_KEY`, `PERPLEXITY_API_KEY`, `XAI_API_KEY`, `DEEPSEEK_API_KEY`, `MISTRAL_API_KEY`, `TOGETHER_API_KEY` | Use instead of the saved key |
| `NEWSBRIEF_MODEL` / `NEWSBRIEF_BASE_URL` | Override model / endpoint |
| `NEWSBRIEF_REGION` | Headline region for Google News, e.g. `IN`, `GB` (default `US`) |
| `NO_COLOR` | Disable colours |

Requires Node 18+.
