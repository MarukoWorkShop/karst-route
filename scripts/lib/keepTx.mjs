/**
 * Notion ↔ YAML bilingual merge.
 *
 * - src language: Notion wins (fallback previous YAML)
 * - translation:
 *   - Notion non-empty AND different from YAML → take Notion (intentional edit)
 *   - src language changed, Notion translation empty or still the old companion →
 *     clear translation (deploy will re-translate from new src)
 *   - YAML translation already empty and src unchanged → keep empty (do not
 *     re-import stale Notion companion text after a clear)
 *   - Notion empty and src unchanged → keep YAML translation
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
 * @param {boolean} srcChanged whether Notion src-language text differs from YAML
 */
export function pickLang(srcLang, lang, fromNotion, fromPrev, srcChanged = false) {
  const n = norm(fromNotion);
  const p = norm(fromPrev);
  if (srcLang === lang) return n || p;

  // Intentional translation edit (Notion differs from current YAML).
  if (n && n !== p) {
    // After a stale-tx clear, YAML tx is empty while Notion still has the old
    // companion. Do not revive it unless src is also changing in this sync
    // (operator wrote a new bilingual pair together).
    if (!p && !srcChanged) return "";
    return n;
  }

  // Src changed: empty or unchanged Notion translation is stale — drop it.
  if (srcChanged && (!n || n === p)) return "";

  return p || n;
}

/**
 * @param {string} srcLang
 * @param {string} notionZh
 * @param {string} notionEn
 * @param {{ zh?: string, en?: string } | null | undefined} prev
 */
export function keepTx(srcLang, notionZh, notionEn, prev) {
  const nZh = norm(notionZh);
  const nEn = norm(notionEn);
  const pZh = norm(prev?.zh);
  const pEn = norm(prev?.en);
  const notionSrc = srcLang === "en" ? nEn : nZh;
  const prevSrc = srcLang === "en" ? pEn : pZh;
  const srcChanged = Boolean(notionSrc) && notionSrc !== prevSrc;

  const zh = pickLang(srcLang, "zh", notionZh, prev?.zh, srcChanged);
  const en = pickLang(srcLang, "en", notionEn, prev?.en, srcChanged);
  return nonemptyPair(zh, en);
}
