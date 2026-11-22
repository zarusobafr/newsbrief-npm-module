function buildPrompt(genre) {
  const now = new Date().toUTCString();
  return `Current date/time: ${now}.

Genre/topic requested by the user: "${genre}"

Use web search to find the 10 most important things that happened in the LAST 24 HOURS about this genre/topic. The genre can be anything (a sport, a game, a market, a region, a niche) — interpret it sensibly.

Rules:
- Only include events from the last 24 hours. If fewer than 10 genuinely exist, return fewer — never pad with older news.
- Rank by importance/impact, most important first.
- "headline": a short punchy title (max ~10 words).
- "summary": 1-2 sentences (max ~35 words) that give the full picture: what happened, who is involved, and why it matters. Include key numbers (scores, prices, dates) when relevant.
- "source": the publication name.
- Write in plain text only: no markdown, no citation tags.

Respond with ONLY a JSON array, no prose, no code fences:
[{"headline":"...","summary":"...","source":"..."}]`;
}

function parseItems(text) {
  const cleaned = String(text).replace(/```json|```/g, "");
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("The AI did not return a readable list. Try again.");
  let arr;
  try {
    arr = JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new Error("The AI returned malformed output. Try again.");
  }
  return arr
    .filter((x) => x && x.headline && x.summary)
    .slice(0, 10)
    .map((x) => ({
      headline: String(x.headline).trim(),
      summary: String(x.summary).trim(),
      source: x.source ? String(x.source).trim() : "",
    }));
}

module.exports = { buildPrompt, parseItems };
