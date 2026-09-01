export type PaceId = "packed" | "slow";
export type PrefId = "culture" | "nature" | "food" | "photo";
export type RouteHint = "kunming-exit" | "nanning-loop" | "hybrid";
export type DraftSource = "ai" | "fallback";

export const PREF_IDS: PrefId[] = ["nature", "culture", "food", "photo"];

export type CraftImplicit = {
  browsedRoute: "r1" | "r2";
  browsedTheme: string;
  themeFilterOn: boolean;
};

export type CraftBrief = {
  startDate: string;
  flexible: boolean;
  days: number;
  travelers: number;
  pace: PaceId;
  prefs: PrefId[];
  budgetUsd: number;
  locale: "en" | "zh";
  implicit: CraftImplicit;
};

export type CraftDay = {
  day: number;
  title: string;
  city: string;
  stay: string;
  beats: string[];
};

export type CraftDraft = {
  headline: string;
  pitch: string;
  routeHint: RouteHint;
  durationDays: number;
  days: CraftDay[];
  why: string[];
  guideNote: string;
  source: DraftSource;
};

const PREF_SET = new Set<PrefId>(PREF_IDS);

function isPref(v: unknown): v is PrefId {
  return typeof v === "string" && PREF_SET.has(v as PrefId);
}

export function validateBrief(raw: unknown): CraftBrief {
  if (!raw || typeof raw !== "object") throw new Error("invalid brief");
  const o = raw as Record<string, unknown>;
  const startDate = typeof o.startDate === "string" ? o.startDate.slice(0, 32) : "";
  const flexible = Boolean(o.flexible);
  const days = clampNum(o.days, 7, 16, 10);
  const travelers = clampNum(o.travelers, 1, 12, 2);
  const pace: PaceId = o.pace === "packed" ? "packed" : o.pace === "slow" ? "slow" : "slow";
  const prefsRaw = Array.isArray(o.prefs) ? o.prefs.filter(isPref) : [];
  const prefs = uniquePrefs(prefsRaw.length ? prefsRaw : [...PREF_IDS]);
  const budgetUsd = clampNum(o.budgetUsd, 500, 8000, 2200);
  const locale: "en" | "zh" = o.locale === "zh" ? "zh" : "en";
  const imp =
    o.implicit && typeof o.implicit === "object"
      ? (o.implicit as Record<string, unknown>)
      : {};
  if (!flexible && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    throw new Error("dates required");
  }
  return {
    startDate: flexible ? startDate : startDate,
    flexible,
    days,
    travelers,
    pace,
    prefs,
    budgetUsd,
    locale,
    implicit: {
      browsedRoute: imp.browsedRoute === "r2" ? "r2" : "r1",
      browsedTheme: typeof imp.browsedTheme === "string" ? imp.browsedTheme.slice(0, 24) : "wild",
      themeFilterOn: Boolean(imp.themeFilterOn),
    },
  };
}

function clampNum(v: unknown, min: number, max: number, fallback: number) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function uniquePrefs(list: PrefId[]) {
  const seen = new Set<PrefId>();
  const out: PrefId[] = [];
  for (const id of list) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

type Stop = {
  id: string;
  city: string;
  title: string;
  stay: string;
  tags: PrefId[];
  beats: string[];
  keep: boolean;
  route: "r1" | "r2" | "both";
};

const STOPS: Stop[] = [
  {
    id: "nanning",
    city: "Nanning",
    title: "Land in Nanning",
    stay: "Nanning",
    tags: ["culture"],
    beats: ["Airport pickup", "A slow first night in the garden city", "Brief with your local lead"],
    keep: true,
    route: "both",
  },
  {
    id: "detian",
    city: "Chongzuo",
    title: "Detian and Mingshi",
    stay: "Chongzuo",
    tags: ["nature", "photo"],
    beats: ["Detian waterfall on the border", "Mingshi Pastoral light", "Karst road, not a highway dash"],
    keep: false,
    route: "both",
  },
  {
    id: "halong",
    city: "Ha Long",
    title: "Into Vietnam, stay Ha Long",
    stay: "Ha Long",
    tags: ["nature", "photo"],
    beats: ["Dongxing–Mong Cai crossing", "Road on to Ha Long", "First night on the bay"],
    keep: true,
    route: "r1",
  },
  {
    id: "halong-cruise",
    city: "Ha Long",
    title: "A day on Ha Long Bay",
    stay: "Ha Long",
    tags: ["nature", "photo"],
    beats: ["Full-day karst cruise", "Limestone isles, not a pier loop", "Second night on the bay"],
    keep: false,
    route: "r1",
  },
  {
    id: "catba",
    city: "Cat Ba",
    title: "Ferry onto Cat Ba",
    stay: "Cat Ba",
    tags: ["nature", "photo"],
    beats: ["Ferry onto Cat Ba", "An unhurried island afternoon", "Night on the harbour, not in a lobby"],
    keep: true,
    route: "both",
  },
  {
    id: "hanoi-city",
    city: "Hanoi",
    title: "Old Quarter, Train Street",
    stay: "Hanoi",
    tags: ["culture", "photo", "food"],
    beats: ["Arrive Hanoi from the coast", "Old Quarter first night", "Two-night base, no packing tomorrow"],
    keep: true,
    route: "both",
  },
  {
    id: "hanoi-table",
    city: "Hanoi",
    title: "Lotus table and the market",
    stay: "Hanoi",
    tags: ["food", "culture"],
    beats: ["Ba Dinh and Ho Chi Minh’s residence", "Cathedral and Train Street", "Cyclo through the 36 Streets"],
    keep: false,
    route: "both",
  },
  {
    id: "sapa",
    city: "Sapa",
    title: "Terraces and Cat Cat",
    stay: "Sapa",
    tags: ["nature", "photo", "culture"],
    beats: ["Private car up from Hanoi, 5.5–6 h", "Terrace afternoon tea on arrival", "First night in the mountains"],
    keep: false,
    route: "both",
  },
  {
    id: "fansipan",
    city: "Sapa",
    title: "Fansipan and Cat Cat",
    stay: "Sapa",
    tags: ["nature", "photo"],
    beats: ["Fansipan cable + Muong Hoa train", "Cat Cat village in the afternoon", "Second night, no packing"],
    keep: false,
    route: "r1",
  },
  {
    id: "jianshui",
    city: "Jianshui",
    title: "Hekou in, Jianshui old town",
    stay: "Jianshui",
    tags: ["culture", "photo"],
    beats: ["Sapa to Lao Cai, then Hekou", "Private car to Jianshui", "Old town after the border dust"],
    keep: true,
    route: "r1",
  },
  {
    id: "puzhehei",
    city: "Puzhehei",
    title: "Tuanshan to the karst lakes",
    stay: "Inside the park",
    tags: ["nature", "photo", "culture"],
    beats: ["Jianshui mini-train and Tuanshan", "Four hours to Puzhehei", "Sleep inside the park"],
    keep: false,
    route: "r1",
  },
  {
    id: "mile",
    city: "Mile",
    title: "Willow boats and Dongfengyun",
    stay: "Mile",
    tags: ["nature", "food", "photo"],
    beats: ["Willow-leaf boat on the lake", "Dongfengyun in late light", "Hot spring if the budget allows"],
    keep: false,
    route: "r1",
  },
  {
    id: "kunming",
    city: "Kunming",
    title: "Green Lake, then the airport",
    stay: "Kunming",
    tags: ["food", "culture"],
    beats: ["Mile to Kunming, ~2 h", "Green Lake and the old street", "Last city night"],
    keep: true,
    route: "r1",
  },
  {
    id: "kunming-fly",
    city: "Depart",
    title: "Changshui, Dounan if the flight is late",
    stay: "Airport",
    tags: ["food"],
    beats: ["Hotel to Changshui", "Dounan flowers if the flight is afternoon or evening", "End in Kunming"],
    keep: true,
    route: "r1",
  },
  {
    id: "friendship",
    city: "Guantang",
    title: "Friendship Pass, into Longzhou",
    stay: "Guantang",
    tags: ["culture"],
    beats: ["Lang Son and Dong Dang", "Youyiguan crossing", "Two-night base in Guantang"],
    keep: true,
    route: "r2",
  },
  {
    id: "tianqin",
    city: "Guantang",
    title: "Tianqin and the cane sea",
    stay: "Guantang",
    tags: ["culture", "nature", "photo"],
    beats: ["Tianqin Zhuang village", "Cycle the cane fields", "A day that does not move hotels"],
    keep: false,
    route: "r2",
  },
  {
    id: "detian-return",
    city: "Nanning",
    title: "Detian on the way home",
    stay: "Nanning",
    tags: ["nature", "photo"],
    beats: ["Detian waterfall", "Mingshi if light is kind", "Back to Nanning for the night"],
    keep: false,
    route: "r2",
  },
  {
    id: "nanning-out",
    city: "Nanning",
    title: "The loop closes",
    stay: "Nanning",
    tags: ["culture"],
    beats: ["Return where you landed", "Buffer morning if flights are tight", "Ask us for an extra night"],
    keep: true,
    route: "r2",
  },
];

export function composeDraft(brief: CraftBrief): CraftDraft {
  const routeHint = pickHint(brief);
  const pool = STOPS.filter((s) => s.route === "both" || matchHint(s.route, routeHint));
  const ranked = [...pool].sort((a, b) => scoreStop(b, brief) - scoreStop(a, brief));
  const chosen: Stop[] = [];
  for (const stop of pool) {
    if (stop.keep) chosen.push(stop);
  }
  for (const stop of ranked) {
    if (chosen.length >= brief.days) break;
    if (chosen.some((c) => c.id === stop.id)) continue;
    if (brief.pace === "packed" && stop.id === "hanoi-table" && brief.prefs[0] !== "food") continue;
    chosen.push(stop);
  }

  const ordered = pool.filter((s) => chosen.some((c) => c.id === s.id));
  let days = ordered;

  while (days.length > brief.days) {
    const droppable = days.filter((d) => !d.keep);
    if (!droppable.length) break;
    droppable.sort((a, b) => scoreStop(a, brief) - scoreStop(b, brief));
    const dropId = droppable[0]?.id;
    days = days.filter((d) => d.id !== dropId);
  }

  if (days.length < brief.days) {
    days = stretchSlow(days, brief.days);
  }

  const top = brief.prefs[0] ?? "nature";
  const headline = headlineFor(routeHint, top, brief.pace);
  const draft: CraftDraft = {
    headline,
    pitch: pitchFor(brief, routeHint),
    routeHint,
    durationDays: days.length,
    days: days.map((stop, i) => ({
      day: i + 1,
      title: stop.title,
      city: stop.city,
      stay: stop.stay,
      beats: beatsFor(stop, brief).slice(0, 3),
    })),
    why: whyFor(brief, routeHint),
    guideNote:
      "A Wanderful local lead takes the border, the car, and the parts you cannot Google. This is a draft — a planner will lock hotels and crossing times with you.",
    source: "fallback",
  };
  return draft;
}

function matchHint(stopRoute: "r1" | "r2", hint: RouteHint) {
  if (hint === "hybrid") return true;
  if (hint === "kunming-exit") return stopRoute === "r1";
  return stopRoute === "r2";
}

function pickHint(brief: CraftBrief): RouteHint {
  const top = brief.prefs[0];
  if (brief.days >= 12 && (top === "nature" || top === "photo")) return "kunming-exit";
  if (brief.pace === "slow" && (top === "culture" || brief.implicit.browsedRoute === "r2")) {
    return "nanning-loop";
  }
  if (brief.days <= 10 && brief.pace === "slow") return "nanning-loop";
  if (brief.implicit.browsedRoute === "r1" && brief.days >= 11) return "kunming-exit";
  return brief.pace === "packed" ? "kunming-exit" : "nanning-loop";
}

function scoreStop(stop: Stop, brief: CraftBrief) {
  let score = stop.keep ? 2 : 0;
  brief.prefs.forEach((pref, i) => {
    if (stop.tags.includes(pref)) score += 8 - i * 2;
  });
  if (brief.implicit.themeFilterOn) {
    const map: Record<string, PrefId> = {
      wild: "nature",
      flavors: "food",
      villages: "culture",
      locals: "culture",
    };
    const want = map[brief.implicit.browsedTheme];
    if (want && stop.tags.includes(want)) score += 2;
  }
  if (brief.budgetUsd >= 3000 && stop.id === "mile") score += 3;
  if (brief.pace === "slow" && (stop.id === "hanoi-table" || stop.id === "tianqin")) score += 3;
  if (brief.pace === "packed" && stop.id === "hanoi-table") score -= 2;
  return score;
}

function stretchSlow(days: Stop[], target: number) {
  const need = target - days.length;
  if (need <= 0) return days;
  const lingerAfter = new Set(["hanoi-city", "sapa", "halong", "friendship"]);
  const out: Stop[] = [];
  let added = 0;
  for (const stop of days) {
    out.push(stop);
    if (added < need && lingerAfter.has(stop.id)) {
      out.push({
        ...stop,
        id: `${stop.id}-linger`,
        title: `Second night, ${stop.city}`,
        beats: [
          "No hotel change",
          "Walk, eat, or photograph without a transfer",
          "Let the place catch up with you",
        ],
      });
      added += 1;
    }
  }
  while (out.length < target) {
    const idx = Math.max(0, out.length - 2);
    const base = out[idx];
    if (!base) break;
    out.splice(idx + 1, 0, {
      ...base,
      id: `${base.id}-extra-${out.length}`,
      title: `Another night, ${base.city}`,
      beats: ["No hotel change", "A quieter morning", "Leave when you are ready"],
    });
  }
  return out;
}

function beatsFor(stop: Stop, brief: CraftBrief) {
  const beats = [...stop.beats];
  if (brief.prefs[0] === "food" && stop.city === "Hanoi") {
    beats[1] = "Lotus buffet and a real coffee, not a set-menu lunch";
  }
  if (brief.prefs[0] === "photo" && stop.tags.includes("photo")) {
    beats[0] = `${beats[0]} — timed for light, not for the bus`;
  }
  if (brief.budgetUsd < 1400 && stop.id === "mile") {
    return ["Willow-leaf boat", "Skip the spa wing", "Simple night in Mile"];
  }
  return beats;
}

function headlineFor(hint: RouteHint, top: PrefId, pace: PaceId) {
  if (hint === "kunming-exit") {
    return top === "photo"
      ? "Karst light, Cat Ba, Sapa — out through Yunnan."
      : "A packed karst line, flying home from Kunming.";
  }
  if (hint === "nanning-loop") {
    return pace === "slow"
      ? "The wild north, slowly — home through Friendship Pass."
      : "North Vietnam and Longzhou, back where you landed.";
  }
  return "A hybrid border draft: Vietnam first, Yunnan if the days allow.";
}

function pitchFor(brief: CraftBrief, hint: RouteHint) {
  const who = brief.travelers === 1 ? "a solo private car" : `a party of ${brief.travelers}`;
  const when = brief.flexible
    ? "Dates stay open; we lock the crossing window with you."
    : `Built around ${brief.startDate}.`;
  const pace =
    brief.pace === "packed"
      ? "Special-ops pacing: early starts, more miles, more in the frame."
      : "Slow pacing: two-night bases, fewer hotel changes.";
  const arc =
    hint === "kunming-exit"
      ? "Nanning in, Mong Cai, Cat Ba and Sapa, then Hekou into Jianshui and Kunming."
      : hint === "nanning-loop"
        ? "Nanning in and out, with Longzhou and Detian on the Guangxi side."
        : "Vietnam’s north as the spine; Yunnan only if your days can carry it.";
  return `${who}. ${when} ${pace} ${arc}`;
}

function whyFor(brief: CraftBrief, hint: RouteHint) {
  const prefLine: Record<PrefId, string> = {
    culture: "Villages and old towns sit on the spine, not as optional add-ons.",
    nature: "Waterfall, terrace and karst lake days keep their light.",
    food: "Hanoi’s table and Yunnan’s night food are written in, not squeezed.",
    photo: "Detian, Sapa and the boats are placed where the light actually works.",
  };
  return [
    prefLine[brief.prefs[0] ?? "nature"],
    hint === "nanning-loop"
      ? "Friendship Pass closes the loop so you do not ferry bags to a second Chinese airport."
      : "Kunming exit keeps Yunnan on the way home, not as a separate trip.",
    brief.budgetUsd >= 2800
      ? "Budget reads as a private-guide line: better rooms, fewer compromises on the cable and the spring."
      : "Budget stays honest — private car and border still included, rooms kept simple.",
  ];
}

export function parseDraft(raw: unknown, fallback: CraftDraft): CraftDraft {
  if (!raw || typeof raw !== "object") return fallback;
  const o = raw as Record<string, unknown>;
  const daysIn = Array.isArray(o.days) ? o.days : [];
  const days: CraftDay[] = daysIn.slice(0, 16).map((d, i) => {
    const row = d && typeof d === "object" ? (d as Record<string, unknown>) : {};
    const beats = Array.isArray(row.beats)
      ? row.beats.filter((b): b is string => typeof b === "string").slice(0, 3)
      : fallback.days[i]?.beats ?? [];
    return {
      day: clampNum(row.day, 1, 16, i + 1),
      title: str(row.title, fallback.days[i]?.title ?? `Day ${i + 1}`),
      city: str(row.city, fallback.days[i]?.city ?? ""),
      stay: str(row.stay, fallback.days[i]?.stay ?? ""),
      beats: beats.length ? beats : (fallback.days[i]?.beats ?? ["Private transfer", "Local table", "Night in"]),
    };
  });
  if (!days.length) return fallback;
  const hint = o.routeHint;
  return {
    headline: str(o.headline, fallback.headline),
    pitch: str(o.pitch, fallback.pitch),
    routeHint:
      hint === "kunming-exit" || hint === "nanning-loop" || hint === "hybrid"
        ? hint
        : fallback.routeHint,
    durationDays: days.length,
    days,
    why: Array.isArray(o.why)
      ? o.why.filter((x): x is string => typeof x === "string").slice(0, 4)
      : fallback.why,
    guideNote: str(o.guideNote, fallback.guideNote),
    source: "ai",
  };
}

function str(v: unknown, fallback: string) {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, 400) : fallback;
}
