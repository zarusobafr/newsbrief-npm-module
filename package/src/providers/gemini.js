const { buildPrompt, parseItems } = require("../prompt");

// Tried in order; we only move to the next one if a model name isn't found (404).
const MODELS = process.env.NEWSBRIEF_MODEL
  ? [process.env.NEWSBRIEF_MODEL]
  : ["gemini-2.5-flash", "gemini-3.5-flash"];

const base = "https://generativelanguage.googleapis.com/v1beta/models";

async function fetchWithGemini(genre, apiKey) {
  const body = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: buildPrompt(genre) }] }],
    tools: [{ google_search: {} }], // live Google Search grounding
  });

  for (const model of MODELS) {
    const res = await fetch(`${base}/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body,
    });

    if (res.status === 404) continue;

    if (!res.ok) {
      let detail = "";
      try {
        detail = (await res.json()).error?.message || "";
      } catch {}
      if (res.status === 401 || res.status === 403 || /api key/i.test(detail)) {
        throw new Error(`Google rejected the API key (${detail || res.status}). Run \`newsbrief --reset-key\` to enter a new one.`);
      }
      if (res.status === 429) throw new Error("Gemini quota/rate limit hit. Wait a minute and try again.");
      throw new Error(`Gemini API error ${res.status}: ${detail}`);
    }

    const data = await res.json();
    const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
    if (!text) {
      const why = data.promptFeedback?.blockReason || data.candidates?.[0]?.finishReason || "empty response";
      throw new Error(`Gemini returned no text (${why}). Try a different wording.`);
    }
    return parseItems(text);
  }
  throw new Error("No available Gemini model found. Set NEWSBRIEF_MODEL to a model your key can use.");
}

module.exports = { fetchWithGemini };
