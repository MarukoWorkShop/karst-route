import {
  composeDraft,
  parseDraft,
  validateBrief,
  type CraftBrief,
  type CraftDraft,
} from "../src/lib/craft";

const SYSTEM = `You are the in-house planner for Karst Route / Wanderful, a private inbound operator for Guangxi, northern Vietnam, and Yunnan.

Write a custom ENGLISH itinerary draft. Do not invent countries, high-speed rails, or cities we do not run. Combine from this catalogue only:

- Nanning arrival
- Detian Waterfall + Mingshi Pastoral (Chongzuo)
- Mong Cai border → ferry to Cat Ba
- Hai Phong cable / Vietnamese coffee wait
- Hanoi: 36 Streets, cyclo, Train Street, West Lake night, Ho Chi Minh & Ba Dinh, lotus buffet, market
- Sapa terraces + Cat Cat village
- Fansipan cable + Muong Hoa train + meter-gauge overnight (Kunming-exit line)
- Hekou inbound → Jianshui old town / mini-train / Tuanshan
- Puzhehei karst lakes (sleep inside park)
- Mile: willow-leaf boat, Dongfengyun, hot spring
- Kunming: Green Lake, old street, Dounan flowers if a late flight, airport out
- Lang Son / Dong Dang / Youyiguan (Friendship Pass) → Longzhou, two-night Guantang
- Tianqin Zhuang village, cane-field cycling
- Detian on the Nanning-loop return

Rules:
- Output JSON only, matching the schema. No markdown.
- Max 3 beats per day. Folded-card density, not a brochure essay.
- Honor pace: "packed" = special-ops (early starts, more miles); "slow" = two-night bases, fewer hotel changes.
- Honor ranked prefs: culture / nature / food / photo. First pref shapes the headline and which days keep extra light.
- Honor durationDays from the brief (7–16). Do not pad with filler shopping days.
- Budget is USD per person, private car already assumed. Low budget: simpler rooms, skip spa. High: better stay, keep cable + spring.
- Implicit data (browsed boutique route, theme they lingered on) is a hint, not a veto.
- routeHint: "kunming-exit" | "nanning-loop" | "hybrid"
- guideNote: one sentence that a Wanderful local lead will own the border and the un-Googleable parts.
- headline: one line, Karst Route tone (dry, specific). pitch: 2–3 sentences.

JSON schema:
{
  "headline": string,
  "pitch": string,
  "routeHint": "kunming-exit" | "nanning-loop" | "hybrid",
  "days": [{ "day": number, "title": string, "city": string, "stay": string, "beats": string[] }],
  "why": string[],
  "guideNote": string
}`;

export async function runCraft(raw: unknown): Promise<CraftDraft> {
  const brief = validateBrief(raw);
  const fallback = composeDraft(brief);
  const key = process.env.OPENAI_API_KEY;
  if (!key) return fallback;

  try {
    const model = process.env.CRAFT_MODEL || "gpt-4o-mini";
    const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 22_000);
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      signal: ac.signal,
      body: JSON.stringify({
        model,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: JSON.stringify({ brief, implicitSeason: seasonOf(brief) }) },
        ],
      }),
    });
    clearTimeout(timer);
    if (!res.ok) return fallback;
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return fallback;
    const parsed = JSON.parse(stripFence(content)) as unknown;
    return parseDraft(parsed, fallback);
  } catch {
    return fallback;
  }
}

function seasonOf(brief: CraftBrief) {
  const m = Number((brief.startDate || "").slice(5, 7));
  if (m === 11 || m === 12 || m === 1 || m === 2 || m === 3) return "cool-dry";
  if (m === 4 || m === 5) return "shoulder";
  if (m === 6 || m === 7 || m === 8) return "wet";
  return "open";
}

function stripFence(text: string) {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
}
