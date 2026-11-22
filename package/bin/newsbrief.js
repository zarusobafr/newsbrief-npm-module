#!/usr/bin/env node
const { getCredentials, setCredentials, clearApiKey, detectProvider, PROVIDERS } = require("../src/config");
const { fetchNews } = require("../src/fetchNews");
const ui = require("../src/ui");

const EXIT_WORDS = new Set(["exit", "quit", "q", ":q"]);

function help() {
  console.log(`
  Usage:
    newsbrief                      Interactive mode (asks for a genre)
    newsbrief <genre>              One-shot, e.g. newsbrief "world security"
    newsbrief --provider gemini    Force a provider (anthropic | gemini)
    newsbrief --reset-key          Forget the saved API key
    newsbrief --help               Show this help

  Works with a Google Gemini key (AQ.… / AIza…) or an Anthropic key (sk-ant-…).
  Set GEMINI_API_KEY / GOOGLE_API_KEY / ANTHROPIC_API_KEY, or paste it once on
  first run (saved to ~/.newsbrief/config.json).
`);
}

function parseArgs(argv) {
  const args = [];
  let provider = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--provider") provider = (argv[++i] || "").toLowerCase();
    else if (a.startsWith("--provider=")) provider = a.split("=")[1].toLowerCase();
    else args.push(a);
  }
  return { args, provider };
}

async function ensureCredentials(forced) {
  const existing = getCredentials(forced);
  if (existing) return existing;

  console.log(`  ${ui.yellow("First-time setup:")} paste your API key — Google Gemini (AQ.… / AIza…) or Anthropic (sk-ant-…).`);
  console.log(`  ${ui.dim("Saved locally, only asked once.")}\n`);
  const key = await ui.ask("  API key › ");
  if (!key || EXIT_WORDS.has(key.toLowerCase())) process.exit(0);

  let provider = forced || detectProvider(key);
  while (!provider) {
    const p = (await ui.ask("  Couldn't tell the provider. Type 'gemini' or 'anthropic' › ")).toLowerCase();
    if (EXIT_WORDS.has(p)) process.exit(0);
    if (PROVIDERS.includes(p)) provider = p;
  }
  setCredentials(provider, key);
  console.log(`  ${ui.green("✓")} Saved (${provider}).\n`);
  return { provider, key };
}

async function briefing(genre, creds) {
  const spin = ui.spinner(`Reading the last 24 hours of "${genre}" news…`);
  try {
    const items = await fetchNews(genre, creds);
    spin.stop();
    if (!items.length) {
      console.log(`\n  ${ui.yellow("No notable news found for")} "${genre}" in the last 24h.\n`);
    } else {
      ui.printNews(genre, items);
    }
  } catch (err) {
    spin.stop();
    console.error(`\n  ${ui.red("✗")} ${err.message}\n`);
  }
}

async function main() {
  const { args, provider: forced } = parseArgs(process.argv.slice(2));

  if (args.includes("--help") || args.includes("-h")) return help();
  if (forced && !PROVIDERS.includes(forced)) {
    console.error(`  ✗ Unknown provider "${forced}". Use anthropic or gemini.`);
    process.exit(1);
  }
  if (args.includes("--reset-key")) {
    clearApiKey();
    console.log("  ✓ Saved API key removed.");
    return;
  }

  ui.printWelcome();
  const creds = await ensureCredentials(forced);

  // One-shot mode: newsbrief finance
  if (args.length) {
    await briefing(args.join(" "), creds);
    ui.closeInput();
    return;
  }

  // Interactive mode
  let prompt = `  ${ui.bold("Which genre?")} ${ui.dim("(e.g. sports, esports, GTA 6, finance, world security)")}\n  › `;
  while (true) {
    const genre = await ui.ask(prompt);
    if (EXIT_WORDS.has(genre.toLowerCase())) break;
    if (!genre) continue;
    await briefing(genre, creds);
    prompt = `  ${ui.bold("Another genre?")} ${ui.dim("(or type 'exit')")}\n  › `;
  }
  console.log("\n  👋 Bye!\n");
  ui.closeInput();
}

main().catch((err) => {
  console.error(`\n  ✗ ${err.message}\n`);
  process.exit(1);
});
