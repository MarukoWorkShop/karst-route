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
  assert(eq(actual.zh, expectZh), `${msg} · zh`);
  assert(eq(actual.en, expectEn), `${msg} · en`);
}

const prev = { zh: "旧中文", en: "Old English" };

// src=zh: only Chinese changed; Notion EN empty → keep YAML EN
assertTx(
  keepTx("zh", "新中文", "", prev),
  "新中文",
  "Old English",
  "src=zh · only ZH · Notion EN empty",
);

// src=zh: only Chinese changed; Notion EN same as YAML → keep YAML EN
assertTx(
  keepTx("zh", "新中文", "Old English", prev),
  "新中文",
  "Old English",
  "src=zh · only ZH · Notion EN unchanged",
);

// src=zh: whitespace-only EN difference still counts as unchanged
assertTx(
  keepTx("zh", "新中文", "  Old English  ", prev),
  "新中文",
  "Old English",
  "src=zh · Notion EN equals YAML after trim",
);

// src=zh: both ZH and EN updated → take Notion EN
assertTx(
  keepTx("zh", "新中文", "New English", prev),
  "新中文",
  "New English",
  "src=zh · ZH+EN both updated",
);

// src=zh: only EN updated in Notion → take Notion EN, keep ZH from Notion (same) or prev
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

// src=zh: Notion ZH empty → fall back to prev ZH
assertTx(
  keepTx("zh", "", "New English", prev),
  "旧中文",
  "New English",
  "src=zh · Notion ZH empty · EN intentional",
);

// src=en mirror: only EN changed, ZH same → keep YAML ZH
assertTx(
  keepTx("en", "旧中文", "New English", prev),
  "旧中文",
  "New English",
  "src=en · only EN · Notion ZH unchanged",
);

// src=en: ZH empty in Notion → keep YAML ZH
assertTx(
  keepTx("en", "", "New English", prev),
  "旧中文",
  "New English",
  "src=en · only EN · Notion ZH empty",
);

// src=en: both updated → take Notion ZH
assertTx(
  keepTx("en", "新中文", "New English", prev),
  "新中文",
  "New English",
  "src=en · ZH+EN both updated",
);

// empty everything → null
assert(keepTx("zh", "", "", null) === null, "both empty → null");

// pickLang unit
assert(eq(pickLang("zh", "zh", "A", "B"), "A"), "pickLang src prefers Notion");
assert(eq(pickLang("zh", "en", "", "B"), "B"), "pickLang tx empty Notion keeps prev");
assert(eq(pickLang("zh", "en", "B", "B"), "B"), "pickLang tx same keeps prev");
assert(eq(pickLang("zh", "en", "C", "B"), "C"), "pickLang tx different takes Notion");

if (failed) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("\nAll keepTx checks passed.");
