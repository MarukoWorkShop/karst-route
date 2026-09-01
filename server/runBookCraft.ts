import {
  catalogFallback,
  compactCatalog,
  parseBookDraft,
  type BookCraftRequest,
  type BookDraft,
} from "../src/lib/bookCraft";

const SYSTEM_ZH = `你是「南境拾遗」的私人行程规划师。客人买的是已有精品线，只微调每天的体验，不改主干。

规则：
- 只输出 JSON，不要 markdown。
- days 数量必须与 catalogue 相同，按同一顺序。不要改 city，不要发明城市。
- catalogue 里的 date 是客人选定出发日起算的日历日，按该日安排当天内容，不要改日期。
- 把 addOns / groupTypes / notes / tweak 写进具体某几天。
- 每天最多 4 条短 bullets；lodging / dining / blurb 各一句，短。
- 没改的天也要输出，可少写字段。

JSON：
{"note":"一两句改了什么","days":[{"bullets":[string],"lodging":string,"dining":[string],"blurb":string}]}`;

const SYSTEM_EN = `You are the in-house planner for The Southern Curations. The guest is booking an existing boutique route. Tailor days; keep the spine.

Rules:
- JSON only, no markdown.
- Same number of days as the catalogue, same city order. Do not invent cities or countries.
- catalogue.date is the guest's calendar day from their start date. Plan that day against it; do not change the date.
- Weave addOns / groupTypes / notes / tweak into specific days.
- Max 4 short bullets per day. lodging / dining / blurb: one line each.
- Include every day; unchanged days may be sparse.

JSON:
{"note":"one or two sentences on what changed","days":[{"bullets":[string],"lodging":string,"dining":[string],"blurb":string}]}`;

export async function runBookCraft(raw: unknown): Promise<BookDraft> {
  const req = raw as BookCraftRequest;
  const locale = req?.locale === "en" ? "en" : "zh";
  const catalog = Array.isArray(req?.catalog) ? req.catalog : [];
  const fallback = catalogFallback(catalog, locale);
  if (!catalog.length) return fallback;

  const key = process.env.ARK_API_KEY;
  if (!key) {
    console.warn("[book-craft] missing ARK_API_KEY");
    return fallback;
  }

  const base = (process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3").replace(/\/$/, "");
  const model = process.env.ARK_MODEL || "ep-20260311152942-w44cf";
  const userPayload = {
    routeId: req.routeId,
    routeTitle: req.routeTitle,
    dates: req.dates,
    travelers: req.travelers,
    groupTypes: req.groupTypes,
    addOns: req.addOns,
    notes: req.notes,
    catalogue: compactCatalog(catalog),
    tweak: req.tweak || "",
    previous: req.previous?.length ? compactCatalog(req.previous) : [],
  };

  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 120_000);
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      signal: ac.signal,
      body: JSON.stringify({
        model,
        temperature: 0.35,
        max_tokens: 4096,
        messages: [
          { role: "system", content: locale === "zh" ? SYSTEM_ZH : SYSTEM_EN },
          { role: "user", content: JSON.stringify(userPayload) },
        ],
      }),
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.warn("[book-craft] ark http", res.status);
      return fallback;
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      console.warn("[book-craft] empty content");
      return fallback;
    }
    const parsed = parseJson(content);
    if (!parsed) {
      console.warn("[book-craft] json parse failed");
      return fallback;
    }
    return parseBookDraft(parsed, catalog, locale);
  } catch (err) {
    const name = err instanceof Error ? err.name : "error";
    console.warn("[book-craft]", name);
    return fallback;
  }
}

function parseJson(text: string): unknown {
  const stripped = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    return JSON.parse(stripped);
  } catch {
    const start = stripped.indexOf("{");
    const end = stripped.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(stripped.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
