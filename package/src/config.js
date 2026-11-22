const fs = require("fs");
const os = require("os");
const path = require("path");

const DIR = path.join(os.homedir(), ".newsbrief");
const FILE = path.join(DIR, "config.json");
const PROVIDERS = ["anthropic", "gemini"];

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
}

function save(data) {
  fs.mkdirSync(DIR, { recursive: true, mode: 0o700 });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), { mode: 0o600 });
}

// Guess the provider from the key's format.
function detectProvider(key) {
  if (!key) return null;
  if (key.startsWith("sk-ant-")) return "anthropic";
  if (key.startsWith("AQ.") || key.startsWith("AIza")) return "gemini";
  return null;
}

// Returns { provider, key } or null. Env vars win over the saved key.
function getCredentials(forced) {
  const envs = {
    anthropic: process.env.ANTHROPIC_API_KEY,
    gemini: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  };
  const cfg = load();
  const savedProvider = cfg.provider || detectProvider(cfg.apiKey);

  if (forced) {
    const key = envs[forced] || (savedProvider === forced ? cfg.apiKey : null);
    return key ? { provider: forced, key } : null;
  }
  if (envs.anthropic) return { provider: "anthropic", key: envs.anthropic };
  if (envs.gemini) return { provider: "gemini", key: envs.gemini };
  if (cfg.apiKey && savedProvider) return { provider: savedProvider, key: cfg.apiKey };
  return null;
}

function setCredentials(provider, apiKey) {
  save({ provider, apiKey });
}

function clearApiKey() {
  save({});
}

module.exports = { getCredentials, setCredentials, clearApiKey, detectProvider, PROVIDERS, FILE };
