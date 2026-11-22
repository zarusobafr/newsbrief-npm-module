const { buildPrompt, parseItems } = require("../prompt");

const MODEL = process.env.NEWSBRIEF_MODEL || "claude-sonnet-5-5";
const API_URL = "https://api.anthropic.com/v1/messages";

async function fetchWithAnthropic(genre, apiKey) {
  const messages = [{ role: "user", content: buildPrompt(genre) }];

  // Web search can pause long turns; keep going up to a few times.
  for (let turn = 0; turn < 4; turn++) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 6 }],
        messages,
      }),
    });

    if (!res.ok) {
      let detail = "";
      try {
        detail = (await res.json()).error?.message || "";
      } catch {}
      if (res.status === 401) throw new Error("Invalid Anthropic API key. Run `newsbrief --reset-key` to enter a new one.");
      if (res.status === 429) throw new Error("Rate limited. Wait a moment and try again.");
      throw new Error(`Anthropic API error ${res.status}: ${detail}`);
    }

    const data = await res.json();

    if (data.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: data.content });
      continue;
    }

    const text = data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    return parseItems(text);
  }
  throw new Error("Search took too long. Try again.");
}

module.exports = { fetchWithAnthropic };
