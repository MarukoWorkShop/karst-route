#!/usr/bin/env node
/** Self-test for Notion bilingual merge rules. Exit 1 on failure. */
import { keepTx, pickLang } from "./lib/keepTx.mjs";

let failed = 0;

function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL  ${msg}`);
    failed += 1;
  } else {
    console.log(`ok    ${msg}`);
  }
}

function eq(a, b) {
  return a === b;
}

function assertTx(actual, expectZh, expectEn, msg) {
  if (actual == null) {
    assert(false, `${msg} — expected pair, got null`);
    return;
  }
  assert(eq(actual.zh, expectZh), `${msg} · zh = ${JSON.stringify(actual.zh)}`);
  assert(eq(actual.en, expectEn), `${msg} · en = ${JSON.stringify(actual.en)}`);
}

const prev = { zh: "旧中文", en: "Old English" };

// src=zh: only Chinese changed; Notion EN empty → clear EN (src changed, stale tx)
assertTx(
  keepTx("zh", "新中文", "", prev),
  "新中文",
  "",
  "src=zh · only ZH · Notion EN empty → clear stale EN",
);

// src=zh: only Chinese changed; Notion EN same as YAML → clear EN (stale companion)
assertTx(
  keepTx("zh", "新中文", "Old English", prev),
  "新中文",
  "",
  "src=zh · only ZH · Notion EN unchanged → clear stale EN",
);

// src=zh: whitespace-only EN difference still counts as unchanged → clear
assertTx(
  keepTx("zh", "新中文", "  Old English  ", prev),
  "新中文",
  "",
  "src=zh · Notion EN equals YAML after trim → clear stale EN",
);

// src=zh: both ZH and EN updated → take Notion EN
assertTx(
  keepTx("zh", "新中文", "New English", prev),
  "新中文",
  "New English",
  "src=zh · ZH+EN both updated",
);

// src=zh: only EN updated in Notion → take Notion EN, ZH from Notion (same as prev)
assertTx(
  keepTx("zh", "旧中文", "New English", prev),
  "旧中文",
  "New English",
  "src=zh · only EN updated",
);

// src=zh: no prev YAML — use Notion
assertTx(
  keepTx("zh", "首发中文", "First English", null),
  "首发中文",
  "First English",
  "src=zh · first sync no prev",
);

// src=zh: Notion ZH empty → fall back to prev ZH; EN intentional (src not changed)
assertTx(
  keepTx("zh", "", "New English", prev),
  "旧中文",
  "New English",
  "src=zh · Notion ZH empty · EN intentional",
);

// src=en: only EN changed; Notion ZH still old companion → clear ZH
assertTx(
  keepTx("en", "旧中文", "New English", prev),
  "",
  "New English",
  "src=en · only EN · Notion ZH unchanged companion → clear ZH",
);

// src=en: ZH empty in Notion → clear ZH (src changed, stale tx)
assertTx(
  keepTx("en", "", "New English", prev),
  "",
  "New English",
  "src=en · only EN · Notion ZH empty → clear stale ZH",
);

// src=en: both updated → take Notion ZH
assertTx(
  keepTx("en", "新中文", "New English", prev),
  "新中文",
  "New English",
  "src=en · ZH+EN both updated",
);

// src=zh: YAML EN already cleared; Notion still has old companion → stay empty
assertTx(
  keepTx("zh", "新中文", "Old English", { zh: "新中文", en: "" }),
  "新中文",
  "",
  "src=zh · do not revive stale Notion EN into empty YAML",
);

// src=zh: YAML EN empty; operator writes new EN together with src touch
assertTx(
  keepTx("zh", "更新中文", "Brand new English", { zh: "新中文", en: "" }),
  "更新中文",
  "Brand new English",
  "src=zh · new bilingual pair after clear",
);

// empty everything → null
assert(keepTx("zh", "", "", null) === null, "both empty → null");

// pickLang unit
assert(eq(pickLang("zh", "zh", "A", "B"), "A"), "pickLang src prefers Notion");
assert(eq(pickLang("zh", "en", "", "B"), "B"), "pickLang tx empty Notion keeps prev when src same");
assert(eq(pickLang("zh", "en", "B", "B"), "B"), "pickLang tx same keeps prev when src same");
assert(eq(pickLang("zh", "en", "C", "B"), "C"), "pickLang tx different takes Notion");
assert(eq(pickLang("zh", "en", "B", "B", true), ""), "pickLang tx same + srcChanged → clear");
assert(eq(pickLang("zh", "en", "", "B", true), ""), "pickLang tx empty + srcChanged → clear");

if (failed) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("\nAll keepTx checks passed.");
