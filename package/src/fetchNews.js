const { fetchWithAnthropic } = require("./providers/anthropic");
const { fetchWithGemini } = require("./providers/gemini");

async function fetchNews(genre, { provider, key }) {
  if (provider === "gemini") return fetchWithGemini(genre, key);
  if (provider === "anthropic") return fetchWithAnthropic(genre, key);
  throw new Error(`Unknown provider "${provider}". Use "anthropic" or "gemini".`);
}

module.exports = { fetchNews };
