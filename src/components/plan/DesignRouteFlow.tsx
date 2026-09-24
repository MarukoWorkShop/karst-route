import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { RouteId } from "@/types";
import {
  EXTRA_DESTS,
  HOTEL_TIERS,
  LINK_NEEDS,
  TRANSPORT_PREFS,
  type HotelTierId,
} from "@/data/planOptions";
import { lightExperiences } from "@/data/lightExperiences";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { labelsOf, sendEnquiry } from "@/lib/enquiry";
import { likeKey, readLikes } from "@/lib/lightLikes";
import { ConciergeFallback } from "@/components/plan/ConciergeFallback";
import { SendFailDialog } from "@/components/plan/SendFailDialog";
import {
  Chip,
  ConciergeForm,
  FieldLabel,
  NavRow,
  OptionBtn,
  Progress,
  SentNote,
  StartOver,
  StepCounter,
  StepKicker,
  fieldClass,
} from "@/components/plan/PlanUi";
import { todayIso } from "@/lib/briefPdf";

function toggle(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

function defaultDays(id: RouteId) {
  if (id === "r1") return 14;
  if (id === "r2") return 11;
  return 7;
}

function durationRange(id: RouteId) {
  if (id === "r3") return { min: 5, max: 12 };
  if (id === "r2") return { min: 8, max: 14 };
  return { min: 8, max: 18 };
}

function routeTitle(id: RouteId) {
  if (id === "r1") return copy.plan.r1Title;
  if (id === "r2") return copy.plan.r2Title;
  return copy.plan.r3Title;
}

function asRoute(id: RouteId | ""): RouteId {
  return id === "r2" || id === "r3" ? id : "r1";
}

const WEEK_ZH = ["日", "一", "二", "三", "四", "五", "六"];
const WEEK_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** 出发日 + 天数 → 结束日（ISO） */
function endIso(start: string, days: number) {
  const [y, m, d] = start.split("-").map(Number);
  if (!y || !m || !d) return start;
  const dt = new Date(y, m - 1, d + days - 1);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}

const SKU_CATALOG = lightExperiences.map((cat) => ({
  id: cat.id,
  title: cat.title,
  skus: [...(cat.routes ?? []), ...(cat.meals ?? [])].map((route) => ({
    key: likeKey(cat.id, route.id),
    title: route.title,
  })),
})).filter((group) => group.skus.length > 0);

export function DesignRouteFlow({ route }: { route: RouteId }) {
  const { t, locale } = useLocale();
  const [step, setStep] = useState(0);
  const [baseRoute, setBaseRoute] = useState<RouteId | "">(route);
  const [duration, setDuration] = useState(defaultDays(route));
  const [extraDests, setExtraDests] = useState<string[]>([]);
  const [customDest, setCustomDest] = useState("");
  const [entryCity, setEntryCity] = useState("");
  const [nextDest, setNextDest] = useState("");
  const [linkNeeds, setLinkNeeds] = useState<string[]>([]);
  const [hotelTier, setHotelTier] = useState<HotelTierId | "">("");
  const [transport, setTransport] = useState<string[]>([]);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [dateMode, setDateMode] = useState<"" | "picker" | "text" | "undecided">("");
  const [dateValue, setDateValue] = useState("");
  const [dateText, setDateText] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [pickedSkus, setPickedSkus] = useState<string[]>(() => [...readLikes()]);
  const [skuTouched, setSkuTouched] = useState(false);
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phase, setPhase] = useState<"ask" | "contact">("ask");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [failOpen, setFailOpen] = useState(false);

  useEffect(() => {
    setBaseRoute(route);
    setDuration(defaultDays(route));
  }, [route]);

  useEffect(() => {
    if (skuTouched) return;
    const sync = () => setPickedSkus([...readLikes()]);
    sync();
    window.addEventListener("light-likes", sync);
    return () => window.removeEventListener("light-likes", sync);
  }, [skuTouched]);

  const rid = asRoute(baseRoute);
  const daysRange = durationRange(rid);
  const partyN = adults + children;
  const autoEnd = dateValue && duration ? endIso(dateValue, duration) : "";

  function fmtDate(iso: string) {
    if (!iso) return "";
    const d = new Date(iso + "T12:00:00");
    const wd = locale === "zh" ? `周${WEEK_ZH[d.getDay()]}` : WEEK_EN[d.getDay()];
    return `${iso}（${wd}）`;
  }

  function dateDisplay() {
    if (dateMode === "undecided") return t(copy.plan.tbcBrowse);
    if (dateMode === "picker" && dateValue) {
      return autoEnd ? `${fmtDate(dateValue)} → ${fmtDate(autoEnd)}` : fmtDate(dateValue);
    }
    return dateText.trim() || t(copy.plan.tbc);
  }

  function listOrDash(items: string[]) {
    const sep = locale === "zh" ? "、" : ", ";
    return items.length ? items.join(sep) : t(copy.plan.dash);
  }

  /** 按类别归组的已选体验：每类一行，摘要 / PDF / 邮件共用 */
  function experienceGroups(lang: "en" | "zh") {
    const groups: { title: string; items: string[] }[] = [];
    for (const group of SKU_CATALOG) {
      const items = group.skus
        .filter((sku) => pickedSkus.includes(sku.key))
        .map((sku) => sku.title[lang]);
      if (items.length) groups.push({ title: group.title[lang], items });
    }
    return groups;
  }

  function briefRows() {
    const hotel = HOTEL_TIERS.find((h) => h.id === hotelTier);
    const sep = locale === "zh" ? "、" : ", ";
    return [
      {
        label: t(copy.plan.rowRoute),
        value: t(routeTitle(rid)),
      },
      { label: t(copy.plan.rowDuration), value: `${duration} ${t(copy.plan.daysUnit)}` },
      { label: t(copy.plan.durationNoteLabel), value: t(copy.plan.durationNote) },
      {
        label: t(copy.plan.rowPeople),
        value:
          locale === "zh"
            ? `${partyN} ${t(copy.plan.peopleUnit)}（${adults} ${t(copy.plan.adults)} / ${children} ${t(copy.plan.children)}）`
            : `${partyN} ${t(copy.plan.peopleUnit)} (${adults} ${t(copy.plan.adults)} / ${children} ${t(copy.plan.children)})`,
      },
      { label: t(copy.plan.rowDates), value: dateDisplay() },
      { label: t(copy.plan.entryCityLabel), value: entryCity.trim() || t(copy.plan.dash) },
      { label: t(copy.plan.nextDestLabel), value: nextDest.trim() || t(copy.plan.dash) },
      {
        label: t(copy.plan.linkNeedsLabel),
        value: linkNeeds.length
          ? labelsOf(linkNeeds, LINK_NEEDS, locale).join(sep)
          : t(copy.plan.none),
      },
      {
        label: t(copy.plan.rowExtra),
        value:
          [
            extraDests.length ? labelsOf(extraDests, EXTRA_DESTS, locale).join(sep) : "",
            customDest.trim(),
          ]
            .filter(Boolean)
            .join(locale === "zh" ? "；" : "; ") || t(copy.plan.none),
      },
      {
        label: t(copy.plan.rowHotel),
        value: hotel ? `${t(hotel.label)} — ${t(hotel.sub)}` : t(copy.plan.dash),
      },
      { label: t(copy.plan.rowTransportPref), value: listOrDash(labelsOf(transport, TRANSPORT_PREFS, locale)) },
      // 特殊体验按类别分行：一行一个栏目，可读性更好（PDF / 邮件同步生效）
      ...(experienceGroups(locale).length
        ? experienceGroups(locale).map((g) => ({ label: g.title, value: g.items.join(sep) }))
        : [{ label: t(copy.plan.rowSpecial), value: t(copy.plan.none) }]),
      ...(notes.trim()
        ? [{ label: t(copy.plan.rowNotes), value: notes.trim() }]
        : []),
      { label: t(copy.plan.rowName), value: name.trim() || t(copy.plan.dash) },
      { label: t(copy.plan.rowContact), value: contact.trim() || t(copy.plan.dash) },
    ];
  }

  function briefBody() {
    return briefRows()
      .map((r) => `${r.label}: ${r.value}`)
      .join("\n")
      .trim();
  }

  async function submit() {
    if (name.trim().length < 2 || !contact.trim()) {
      setError(true);
      return;
    }
    setError(false);
    setSendError(false);
    setSending(true);
    // try/finally：无论发送层发生什么，按钮都要从「发送中」复位
    try {
      await sendBrief();
    } finally {
      setSending(false);
    }
  }

  async function sendBrief() {
    const hotel = HOTEL_TIERS.find((h) => h.id === hotelTier);
    const ok = await sendEnquiry({
      subject: `New custom route request — ${rid}`,
      name: name.trim(),
      contact: contact.trim(),
      path: "design",
      route: rid,
      duration: String(duration),
      travelers: String(partyN),
      adults: String(adults),
      children: String(children),
      dates: dateDisplay(),
      entryCity: entryCity.trim(),
      nextDest: nextDest.trim(),
      linkNeeds: labelsOf(linkNeeds, LINK_NEEDS, "en").join(", "),
      hotel: hotel ? hotel.label.en : "",
      extraDests: labelsOf(extraDests, EXTRA_DESTS, "en").join(", "),
      extraCustom: customDest.trim(),
      transport: labelsOf(transport, TRANSPORT_PREFS, "en").join(", "),
      special: experienceGroups("en")
        .map((g) => `${g.title}: ${g.items.join(", ")}`)
        .join("\n"),
      notes: notes.trim(),
      brief: briefBody(),
    });
    if (ok) {
      setSent(true);
      setFailOpen(false);
    } else {
      setSendError(true);
      setFailOpen(true);
    }
  }

  function restart() {
    setPhase("ask");
    setSent(false);
    setStep(0);
    setError(false);
    setSendError(false);
    setFailOpen(false);
  }

  if (phase === "contact") {
    return (
      <div>
        <p className="mb-5 text-[13px] leading-5 text-ink-soft">{t(copy.plan.designSubmitLead)}</p>
        <div className="mb-5 overflow-hidden rounded-xl border border-cta/20 bg-paper/50 px-4 py-1">
          {briefRows()
            .filter((r) => r.label !== t(copy.plan.rowName) && r.label !== t(copy.plan.rowContact))
            .map((r) => (
              <div key={r.label} className="flex justify-between gap-3 border-t border-line py-2.5 first:border-t-0">
                <span className="shrink-0 text-[12px] text-ink-soft">{r.label}</span>
                <span className="text-right text-[13px] font-semibold leading-5 whitespace-pre-line text-ink">{r.value}</span>
              </div>
            ))}
        </div>
        {sent ? (
          <SentNote />
        ) : (
          <>
            <ConciergeForm
              name={name}
              contact={contact}
              sending={sending}
              error={error}
              errorText={sendError ? t(copy.plan.sendFail) : undefined}
              onName={setName}
              onContact={setContact}
              onSend={() => void submit()}
            />
            {sendError ? (
              <ConciergeFallback
                rows={briefRows()}
                filename={`karst-design-request-${rid}.pdf`}
                kicker={t(copy.plan.designLead)}
                title={t(routeTitle(rid))}
              />
            ) : null}
          </>
        )}
        {sent ? (
          <StartOver onClick={restart} />
        ) : (
          <button
            type="button"
            onClick={() => setPhase("ask")}
            className="mt-4 h-12 w-full rounded-lg border-[1.5px] border-line text-[15px] font-semibold text-ink"
          >
            {t(copy.plan.back)}
          </button>
        )}

        <SendFailDialog
          open={failOpen && sendError}
          sending={sending}
          rows={briefRows()}
          filename={`karst-design-request-${rid}.pdf`}
          kicker={t(copy.plan.designLead)}
          title={t(routeTitle(rid))}
          onRetry={() => void submit()}
          onClose={() => setFailOpen(false)}
        />
      </div>
    );
  }

  const extraNote =
    extraDests.length === 1
      ? t(copy.plan.extraPickedOne).replace("{days}", String(duration + extraDests.length))
      : t(copy.plan.extraPicked)
          .replace("{n}", String(extraDests.length))
          .replace("{days}", String(duration + extraDests.length));

  return (
    <div>
      <p className="mb-5 text-[13px] leading-[22px] text-ink-soft">{t(copy.plan.designLead)}</p>
      <Progress step={step} total={6} />
      <StepKicker>{copy.plan.designSteps[step] ? t(copy.plan.designSteps[step]) : null}</StepKicker>

      {step === 0 ? (
        <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.95fr)] md:gap-8">
          {/* 左：路线卡片 + 出行人数（与直接预订的格式一致） */}
          <div className="flex min-w-0 flex-col gap-6">
            <div>
              <FieldLabel>{t(copy.plan.chooseRoute)}</FieldLabel>
              <div className="mt-2 flex flex-col gap-2.5">
                {(
                  [
                    { val: "r1" as const, days: 14, title: copy.plan.r1Title, sub: copy.plan.r1SubLong },
                    { val: "r2" as const, days: 11, title: copy.plan.r2Title, sub: copy.plan.r2SubLong },
                    { val: "r3" as const, days: 7, title: copy.plan.r3Title, sub: copy.plan.r3SubLong },
                  ] as const
                ).map((r) => {
                  const on = baseRoute === r.val;
                  return (
                    <OptionBtn
                      key={r.val}
                      active={on}
                      onClick={() => {
                        setBaseRoute(r.val);
                        const range = durationRange(r.val);
                        setDuration(Math.min(Math.max(r.days, range.min), range.max));
                      }}
                    >
                      <div className="mb-[3px] font-semibold">{t(r.title)}</div>
                      <div className={`text-[12px] ${on ? "text-cta" : "text-ink-soft"}`}>{t(r.sub)}</div>
                    </OptionBtn>
                  );
                })}
              </div>
            </div>

            <div>
              <FieldLabel>{t(copy.plan.travelersN).replace("{n}", String(partyN))}</FieldLabel>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <StepCounter
                  label={t(copy.plan.adults)}
                  value={adults}
                  min={1}
                  max={14}
                  onChange={setAdults}
                />
                <StepCounter
                  label={t(copy.plan.children)}
                  value={children}
                  min={0}
                  max={10}
                  onChange={setChildren}
                />
              </div>
            </div>
          </div>

          {/* 右：总天数调整 */}
          <div className="min-w-0">
            <FieldLabel>{t(copy.plan.totalDays).replace("{n}", String(duration))}</FieldLabel>
            <input
              type="range"
              min={daysRange.min}
              max={daysRange.max}
              value={Math.min(Math.max(duration, daysRange.min), daysRange.max)}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="range-forest mt-3 w-full"
            />
            <div className="mt-1 flex justify-between text-[11px] text-ink-soft">
              <span>
                {daysRange.min}
                {t(copy.plan.daysUnit)}
                {locale === "zh" ? "（精简）" : ""}
              </span>
              <span>
                {daysRange.max}
                {t(copy.plan.daysUnit)}
                {locale === "zh" ? "（深度）" : ""}
              </span>
            </div>
            <div className="mt-4 rounded-lg bg-sage px-3.5 py-2.5 text-[12.5px] leading-5 text-ink-soft">
              {locale === "zh"
                ? "这里填的是期望天数：实际安排会根据到访城市与您的具体要求，由旅行管家量身设计。下一步填时间与衔接安排。"
                : "This is your preferred length — the final itinerary is designed by your concierge based on the cities visited and your requests. Dates and connections come next."}
            </div>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="flex flex-col gap-5">
          <div>
            <FieldLabel>{t(copy.plan.travelDates)}</FieldLabel>
            <div className={`mt-2 flex gap-2 ${dateMode ? "mb-3.5" : ""}`}>
              {(
                [
                  ["picker", copy.plan.datePicker],
                  ["text", copy.plan.dateText],
                  ["undecided", copy.plan.dateBrowse],
                ] as const
              ).map(([mode, label]) => {
                const on = dateMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      if (dateMode === mode) {
                        setDateMode("");
                        return;
                      }
                      if (mode === "picker") {
                        flushSync(() => setDateMode("picker"));
                        const el = dateInputRef.current;
                        if (!el) return;
                        el.focus();
                        try {
                          el.showPicker?.();
                        } catch {
                          /* showPicker 需要用户手势；focus 仍会落在输入框 */
                        }
                        return;
                      }
                      setDateMode(mode);
                    }}
                    className={`flex-1 rounded-lg border-[1.5px] px-1.5 py-[9px] text-center text-[12px] font-semibold ${
                      on
                        ? "border-cta bg-cta/10 text-cta"
                        : "border-line/90 bg-transparent text-ink hover:border-cta/35"
                    }`}
                  >
                    {t(label)}
                  </button>
                );
              })}
            </div>
            {dateMode === "picker" ? (
              <div className="flex items-end gap-2.5">
                <label className="block flex-1">
                  <span className="mb-1 block text-[11px] font-semibold text-ink-soft">
                    {t(copy.plan.startDate)}
                  </span>
                  <input
                    ref={dateInputRef}
                    type="date"
                    min={todayIso()}
                    value={dateValue}
                    onChange={(e) => {
                      const next = e.target.value;
                      const min = todayIso();
                      setDateValue(next && next < min ? min : next);
                    }}
                    className={fieldClass}
                  />
                </label>
                {autoEnd ? (
                  <>
                    <div className="pb-3 text-[18px] text-ink-soft">→</div>
                    <div className="flex-1">
                      <span className="mb-1 block text-[11px] font-semibold text-ink-soft">
                        {t(copy.plan.endDateAuto)}
                      </span>
                      <div className={`${fieldClass} flex items-center bg-sage text-ink-soft`}>
                        {autoEnd}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
            {dateMode === "text" ? (
              <input
                type="text"
                autoFocus
                value={dateText}
                placeholder={t(copy.plan.dateTextPh)}
                onChange={(e) => setDateText(e.target.value)}
                className={fieldClass}
              />
            ) : null}
            {dateMode === "undecided" ? (
              <div className="rounded-lg bg-sage px-3.5 py-2.5 text-[13px] leading-5 font-semibold text-ink">
                {t(copy.plan.dateBrowseNote)}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-4">
            <label className="block">
              <FieldLabel>{t(copy.plan.entryCityLabel)}</FieldLabel>
              <input
                type="text"
                value={entryCity}
                placeholder={t(copy.plan.entryCityPh)}
                onChange={(e) => setEntryCity(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <FieldLabel>{t(copy.plan.nextDestLabel)}</FieldLabel>
              <input
                type="text"
                value={nextDest}
                placeholder={t(copy.plan.nextDestPh)}
                onChange={(e) => setNextDest(e.target.value)}
                className={fieldClass}
              />
            </label>
            <div>
              <FieldLabel>{t(copy.plan.linkNeedsLabel)}</FieldLabel>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {LINK_NEEDS.map((n) => (
                  <Chip
                    key={n.id}
                    active={linkNeeds.includes(n.id)}
                    onClick={() => setLinkNeeds((cur) => toggle(cur, n.id))}
                  >
                    {t(n.label)}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <p className="mb-4 text-[13px] text-ink-soft">{t(copy.plan.extraHint)}</p>
          <div className="flex flex-wrap gap-2.5">
            {EXTRA_DESTS.map((d) => (
              <Chip
                key={d.id}
                active={extraDests.includes(d.id)}
                onClick={() => setExtraDests((cur) => toggle(cur, d.id))}
              >
                {t(d.label)}
              </Chip>
            ))}
          </div>
          {extraDests.length > 0 ? (
            <div className="mt-3.5 rounded-lg bg-paper/60 px-3.5 py-2.5 text-[12px] text-ink-soft">{extraNote}</div>
          ) : null}
          <label className="mt-4 block">
            <FieldLabel>{t(copy.plan.customDestLabel)}</FieldLabel>
            <textarea
              rows={2}
              value={customDest}
              placeholder={t(copy.plan.customDestPh)}
              onChange={(e) => setCustomDest(e.target.value)}
              className="mt-1.5 w-full resize-y rounded-lg border-[1.5px] border-line/90 bg-paper/70 px-3.5 py-3 text-[15px] leading-[1.6] text-ink placeholder:text-ink-soft/70 outline-none"
            />
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="flex flex-col gap-2.5">
          {HOTEL_TIERS.map((tier) => {
            const on = hotelTier === tier.id;
            return (
              <OptionBtn key={tier.id} active={on} onClick={() => setHotelTier(tier.id)}>
                <div className="mb-0.5 font-semibold">{t(tier.label)}</div>
                <div className={`text-[12px] ${on ? "text-cta" : "text-ink-soft"}`}>{t(tier.sub)}</div>
              </OptionBtn>
            );
          })}
        </div>
      ) : null}

      {step === 4 ? (
        <div>
          <p className="mb-4 text-[13px] text-ink-soft">{t(copy.plan.transportHint)}</p>
          <div className="flex flex-wrap gap-2.5">
            {TRANSPORT_PREFS.map((p) => (
              <Chip
                key={p.id}
                active={transport.includes(p.id)}
                onClick={() => setTransport((cur) => toggle(cur, p.id))}
              >
                {t(p.label)}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div>
          <p className="mb-4 text-[13px] text-ink-soft">{t(copy.plan.expHint)}</p>
          <div className="mb-5 flex flex-col gap-4">
            {SKU_CATALOG.map((group) => (
              <div key={group.id}>
                <p className="mb-2 text-[12px] font-medium text-ink-soft">{t(group.title)}</p>
                <div className="flex flex-wrap gap-2">
                  {group.skus.map((sku) => (
                    <Chip
                      key={sku.key}
                      active={pickedSkus.includes(sku.key)}
                      onClick={() => {
                        setSkuTouched(true);
                        setPickedSkus((cur) => toggle(cur, sku.key));
                      }}
                    >
                      {t(sku.title)}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <label className="block">
            <FieldLabel>{t(copy.plan.moreIdeas)}</FieldLabel>
            <textarea
              rows={3}
              value={notes}
              placeholder={t(copy.plan.moreIdeasPh)}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 w-full resize-y rounded-lg border-[1.5px] border-line/90 bg-paper/70 px-3.5 py-3 text-[15px] leading-[1.6] text-ink placeholder:text-ink-soft/70 outline-none"
            />
          </label>
        </div>
      ) : null}

      <NavRow
        step={step}
        total={6}
        lastLabel={t(copy.plan.genDesign)}
        onBack={() => setStep((s) => s - 1)}
        onNext={() => {
          if (step < 5) setStep((s) => s + 1);
          else setPhase("contact");
        }}
      />
    </div>
  );
}
