/**
 * Notion ↔ YAML bilingual merge.
 *
 * - src language: Notion wins (fallback previous YAML)
 * - translation: keep YAML unless Notion text is non-empty AND differs from YAML
 *   (intentional bilingual edit). Empty Notion translation never clears YAML.
 */

export function pair(zh, en) {
  return { en: en ?? "", zh: zh ?? "" };
}

export function nonemptyPair(zh, en) {
  const p = pair(zh, en);
  return p.en.trim() || p.zh.trim() ? p : null;
}

function norm(s) {
  return String(s ?? "").trim();
}

/**
 * @param {string} srcLang "zh" | "en" (or other locale code matching a key)
 * @param {string} lang language being resolved
 * @param {string} fromNotion value from Notion column
 * @param {string} fromPrev value from existing YAML
 */
export function pickLang(srcLang, lang, fromNotion, fromPrev) {
  const n = norm(fromNotion);
  const p = norm(fromPrev);
  if (srcLang === lang) return n || p;
  // Translation: only take Notion when it intentionally differs from YAML.
  if (n && n !== p) return n;
  return p || n;
}

/**
 * @param {string} srcLang
 * @param {string} notionZh
 * @param {string} notionEn
 * @param {{ zh?: string, en?: string } | null | undefined} prev
 */
export function keepTx(srcLang, notionZh, notionEn, prev) {
  const zh = pickLang(srcLang, "zh", notionZh, prev?.zh);
  const en = pickLang(srcLang, "en", notionEn, prev?.en);
  return nonemptyPair(zh, en);
}
