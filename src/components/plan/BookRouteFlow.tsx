import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { RouteId } from "@/types";
import { routes } from "@/data/itinerary";
import { ADD_ONS, GROUP_TYPES, type DateMode } from "@/data/planOptions";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { labelsOf, sendEnquiry } from "@/lib/enquiry";
import {
  addDaysIso,
  daysToBrief,
  downloadBriefPdf,
  pdfChrome,
  stampDays,
  todayIso,
  type BriefDay,
} from "@/lib/briefPdf";
import { ItinDays } from "@/components/plan/ItinDays";
import { PriceEstimate } from "@/components/plan/PriceEstimate";
import { estimateParty, estSummaryLine } from "@/lib/estimate";
import {
  Chip,
  ConciergeForm,
  FieldLabel,
  IconDownload,
  NavRow,
  OptionBtn,
  Progress,
  RadioDot,
  SentNote,
  StartOver,
  StepKicker,
  fieldClass,
} from "@/components/plan/PlanUi";

const WEEK_ZH = ["日", "一", "二", "三", "四", "五", "六"];
const WEEK_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function routeDays(id: RouteId | ""): number | null {
  if (id === "r1") return 14;
  if (id === "r2") return 10;
  if (id === "r3") return 7;
  return null;
}

function asRoute(id: RouteId | ""): RouteId {
  return id === "r2" || id === "r3" ? id : "r1";
}

function bookingPdfFilename(rid: RouteId) {
  return {
    r1: "karst-r1-three-realms-booking.pdf",
    r2: "karst-r2-southern-loop-booking.pdf",
    r3: "karst-r3-chongzuo-weizhou-booking.pdf",
  }[rid];
}

function endIso(start: string, days: number) {
  return addDaysIso(start, days - 1);
}

function toggle(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

export function BookRouteFlow({ route }: { route: RouteId }) {
  const { t, locale } = useLocale();
  const [step, setStep] = useState(0);
  const [baseRoute, setBaseRoute] = useState<RouteId | "">(route);
  const [dateMode, setDateMode] = useState<DateMode | "">("");
  const [dateValue, setDateValue] = useState("");
  const [dateText, setDateText] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [groupTypes, setGroupTypes] = useState<string[]>([]);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phase, setPhase] = useState<"ask" | "ready">("ask");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfErr, setPdfErr] = useState(false);
  const [tweak, setTweak] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBaseRoute(route);
  }, [route]);

  const days = routeDays(baseRoute);
  const autoEnd = dateValue && days ? endIso(dateValue, days) : "";
  const partyN = adults + children;
  const est = baseRoute ? estimateParty(baseRoute as RouteId, adults, children) : null;

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

  function routeLabel(short = false) {
    if (baseRoute === "r1") return t(short ? copy.plan.r1Short : copy.plan.r1Title);
    if (baseRoute === "r2") return t(short ? copy.plan.r2Short : copy.plan.r2Title);
    if (baseRoute === "r3") return t(short ? copy.plan.r3Short : copy.plan.r3Title);
    return "—";
  }

  function dateModeLabel() {
    if (dateMode === "picker") return t(copy.plan.datePicker);
    if (dateMode === "text") return t(copy.plan.dateText);
    if (dateMode === "undecided") return t(copy.plan.dateBrowse);
    return t(copy.plan.dash);
  }

  function listOrDash(items: string[]) {
    const sep = locale === "zh" ? "、" : ", ";
    return items.length ? items.join(sep) : t(copy.plan.dash);
  }

  function briefRows() {
    const groups = labelsOf(groupTypes, GROUP_TYPES, locale);
    const extras = labelsOf(addOns, ADD_ONS, locale);
    const rows: { label: string; value: string }[] = [
      { label: t(copy.plan.rowRoute), value: routeLabel(false) },
      { label: t(copy.plan.rowDateMode), value: dateModeLabel() },
      { label: t(copy.plan.rowDates), value: dateDisplay() },
      { label: t(copy.plan.rowPeople), value: `${partyN} ${t(copy.plan.peopleUnit)}` },
      { label: t(copy.plan.rowGroup), value: listOrDash(groups) },
      { label: t(copy.plan.rowAddons), value: extras.length ? extras.join(locale === "zh" ? "、" : ", ") : t(copy.plan.none) },
      { label: t(copy.plan.rowNotes), value: notes.trim() || t(copy.plan.none) },
      { label: t(copy.plan.rowTweak), value: tweak.trim() || t(copy.plan.none) },
    ];
    if (est) {
      rows.push({ label: t(copy.plan.rowEstimate), value: estSummaryLine(est, t, locale) });
    }
    rows.push(
      { label: t(copy.plan.rowName), value: name.trim() || t(copy.plan.dash) },
      { label: t(copy.plan.rowContact), value: contact.trim() || t(copy.plan.dash) },
    );
    return rows;
  }

  function startIso() {
    if (dateMode === "picker" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
    return "";
  }

  function catalogDays(): BriefDay[] {
    const rid = asRoute(baseRoute);
    return stampDays(daysToBrief(routes[rid].days, t), startIso(), locale);
  }

  function pdfDays(): BriefDay[] {
    return stampDays(catalogDays(), startIso(), locale);
  }

  function briefBody() {
    const lines = briefRows().map((r) => `${r.label}: ${r.value}`);
    lines.push("");
    pdfDays().forEach((d) => {
      lines.push(`Day ${d.num}${d.date ? ` · ${d.date}` : ""} · ${d.city}`);
      lines.push(`  ${d.stay}`);
      d.bullets.forEach((b) => lines.push(`  · ${b}`));
      if (d.transport) lines.push(`  ${t(copy.tours.book.transport)}: ${d.transport}`);
      if (d.lodging) lines.push(`  ${t(copy.tours.book.stay)}: ${d.lodging}`);
      (d.dining ?? []).forEach((meal) => lines.push(`  ${t(copy.tours.book.dining)}: ${meal}`));
      if (d.drive) lines.push(`  ${t(copy.plan.pdfDrive)}: ${d.drive}`);
      lines.push("");
    });
    return lines.join("\n").trim();
  }

  async function downloadPdf() {
    const rid = asRoute(baseRoute);
    setPdfBusy(true);
    setPdfErr(false);
    try {
      await downloadBriefPdf({
        filename: bookingPdfFilename(rid),
        kicker: t(copy.plan.summary),
        title: routeLabel(false),
        generated: t(copy.plan.pdfGenerated).replace(
          "{d}",
          new Date().toLocaleString(locale === "zh" ? "zh-CN" : "en-GB"),
        ),
        rows: briefRows(),
        days: pdfDays(),
        ...pdfChrome(t),
      });
    } catch {
      setPdfErr(true);
    } finally {
      setPdfBusy(false);
    }
  }

  async function submit() {
    if (name.trim().length < 2 || !contact.trim()) {
      setError(true);
      return;
    }
    setError(false);
    setSending(true);
    const ok = await sendEnquiry({
      subject: `New Karst Route booking — ${baseRoute || "unset"}`,
      name: name.trim(),
      contact: contact.trim(),
      path: "book",
      route: baseRoute || "",
      dates: dateDisplay(),
      travelers: `${partyN} ${t(copy.plan.peopleUnit)} (${adults} ${t(copy.plan.adults)} / ${children} ${t(copy.plan.children)})`,
      adults: String(adults),
      children: String(children),
      estimate: est ? estSummaryLine(est, t, locale) : "",
      groupTypes: labelsOf(groupTypes, GROUP_TYPES, "en").join(", "),
      addOns: labelsOf(addOns, ADD_ONS, "en").join(", "),
      notes: notes.trim(),
      tweak: tweak.trim(),
      brief: briefBody(),
    });
    setSending(false);
    if (ok) setSent(true);
    else setError(true);
  }

  if (phase === "ready") {
    const groups = labelsOf(groupTypes, GROUP_TYPES, locale);
    const extras = labelsOf(addOns, ADD_ONS, locale);
    const rows: [string, string, boolean?][] = [
      [t(copy.plan.rowRoute), routeLabel(true)],
      [t(copy.plan.rowDates), dateDisplay(), true],
      [t(copy.plan.rowPeople), `${partyN} ${t(copy.plan.peopleUnit)}`],
      ...(est
        ? ([[t(copy.plan.rowEstimate), estSummaryLine(est, t, locale), true]] as [string, string, boolean][])
        : []),
      [
        t(copy.plan.rowGroup),
        groups.length ? groups.join(locale === "zh" ? "、" : ", ") : t(copy.plan.dash),
        groups.length > 2,
      ],
      [
        t(copy.plan.rowAddons),
        extras.length ? extras.join(locale === "zh" ? "、" : ", ") : t(copy.plan.none),
        extras.length > 0,
      ],
      ...(notes.trim() ? ([[t(copy.plan.rowNotes), notes.trim(), true]] as [string, string, boolean][]) : []),
    ];

    return (
      <div>
        <div className="mb-1 rounded-xl border border-line/80 bg-bone/30 px-5 pt-5 pb-1">
          <div className="mb-2.5 text-[13px] font-semibold tracking-[0.06em] text-gold">
            {t(copy.plan.summary)}
          </div>
          {rows.map(([k, v, wrap]) => (
            <div
              key={k}
              className={`flex justify-between gap-3 border-t border-line py-2.5 ${
                wrap ? "items-start" : "items-center"
              }`}
            >
              <span className={`shrink-0 text-[12px] text-ink-soft ${wrap ? "pt-px" : ""}`}>{k}</span>
              <span className="text-right text-[13px] font-semibold leading-5 text-ink">{v}</span>
            </div>
          ))}
          <div className="h-3" />
        </div>

        <div className="mt-5">
          <ItinDays days={pdfDays()} />
        </div>

        <div className="mt-4 overflow-hidden rounded-[10px] border border-line">
          <div className="bg-bone/25 px-4 py-3.5">
            <p className="text-[14px] font-semibold leading-[1.55] text-ink">{t(copy.plan.tweakLabel)}</p>
          </div>
          <div className="flex flex-col gap-2 p-4">
            <textarea
              rows={3}
              value={tweak}
              placeholder={t(copy.plan.tweakPh)}
              onChange={(e) => setTweak(e.target.value)}
              className="w-full resize-y rounded-lg border-[1.5px] border-line/90 bg-paper/70 px-3.5 py-3 text-[15px] leading-[1.6] text-ink placeholder:text-ink-soft/70 outline-none"
            />
            <p className="text-[12px] leading-5 text-ink-soft">{t(copy.plan.tweakHint)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          <button
            type="button"
            disabled={pdfBusy}
            onClick={() => void downloadPdf()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-cta bg-transparent text-[15px] font-semibold text-cta disabled:opacity-60"
          >
            <IconDownload />
            {pdfBusy
              ? t(copy.plan.pdfPreparing)
              : t(copy.plan.downloadPdf)}
          </button>
          {pdfErr ? <p className="text-[13px] text-danger">{t(copy.plan.pdfFailed)}</p> : null}
          {sent ? (
            <SentNote />
          ) : (
            <ConciergeForm
              name={name}
              contact={contact}
              sending={sending}
              error={error}
              onName={setName}
              onContact={setContact}
              onSend={() => void submit()}
            />
          )}
        </div>
        <StartOver
          onClick={() => {
            setPhase("ask");
            setSent(false);
            setStep(0);
            setError(false);
            setTweak("");
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <p className="mb-5 text-[13px] leading-5 text-ink-soft">{t(copy.plan.bookLead)}</p>
      <Progress step={step} total={3} />
      <StepKicker>{copy.plan.bookSteps[step] ? t(copy.plan.bookSteps[step]) : null}</StepKicker>

      {step === 0 ? (
        <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.95fr)] md:gap-8">
          {/* 左：路线 / 人数 / 时间 */}
          <div className="flex min-w-0 flex-col gap-6">
            <div>
              <FieldLabel>{t(copy.plan.chooseRoute)}</FieldLabel>
              <div className="mt-2 flex flex-col gap-2.5">
                {(
                  [
                    { val: "r1" as const, title: copy.plan.r1Title, sub: copy.plan.r1Sub },
                    { val: "r2" as const, title: copy.plan.r2Title, sub: copy.plan.r2Sub },
                    { val: "r3" as const, title: copy.plan.r3Title, sub: copy.plan.r3Sub },
                  ] as const
                ).map((r) => {
                  const on = baseRoute === r.val;
                  return (
                    <OptionBtn key={r.val} active={on} onClick={() => setBaseRoute(r.val)} className="flex items-center gap-3">
                      <RadioDot on={on} />
                      <span>
                        <span className="block text-[14px] font-semibold">{t(r.title)}</span>
                        <span className={`mt-px block text-[12px] ${on ? "text-cta" : "text-ink-soft"}`}>
                          {t(r.sub)}
                        </span>
                      </span>
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
                  icon="adult"
                  value={adults}
                  min={1}
                  max={14}
                  onChange={setAdults}
                />
                <StepCounter
                  label={t(copy.plan.children)}
                  icon="child"
                  value={children}
                  min={0}
                  max={10}
                  onChange={setChildren}
                />
              </div>
            </div>

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
                            /* showPicker needs a user gesture; focus still lands on the field */
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
                    <span className="mb-1 block text-[11px] font-semibold text-ink-soft">{t(copy.plan.startDate)}</span>
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
                        <div className={`${fieldClass} flex items-center bg-sage text-ink-soft`}>{autoEnd}</div>
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
          </div>

          {/* 右：参考报价（桌面 sticky；手机在下方） */}
          <div className="min-w-0 md:sticky md:top-28">
            <PriceEstimate route={baseRoute} adults={adults} children={children} />
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div>
          <p className="mb-4 text-[13px] text-ink-soft">{t(copy.plan.groupHint)}</p>
          <div className="flex flex-wrap gap-2.5">
            {GROUP_TYPES.map((g) => (
              <Chip
                key={g.id}
                active={groupTypes.includes(g.id)}
                onClick={() => setGroupTypes((cur) => toggle(cur, g.id))}
              >
                {t(g.label)}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <p className="mb-4 text-[13px] text-ink-soft">{t(copy.plan.addOnHint)}</p>
          <div className="mb-6 flex flex-wrap gap-2.5">
            {ADD_ONS.map((a) => (
              <Chip key={a.id} active={addOns.includes(a.id)} onClick={() => setAddOns((cur) => toggle(cur, a.id))}>
                {t(a.label)}
              </Chip>
            ))}
          </div>
          <label className="block">
            <FieldLabel>{t(copy.plan.specialReq)}</FieldLabel>
            <textarea
              rows={3}
              value={notes}
              placeholder={t(copy.plan.specialReqPh)}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full resize-y rounded-lg border-[1.5px] border-line/90 bg-paper/70 px-3.5 py-3 text-[15px] leading-[1.6] text-ink placeholder:text-ink-soft/70 outline-none"
            />
          </label>
        </div>
      ) : null}

      <NavRow
        step={step}
        total={3}
        lastLabel={t(copy.plan.genBook)}
        onBack={() => setStep((s) => s - 1)}
        onNext={() => {
          if (step < 2) setStep((s) => s + 1);
          else setPhase("ready");
        }}
      />
    </div>
  );
}

function IconAdult({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="8" cy="4.25" r="2.25" />
      <path d="M3.5 13.5v-.75a4.5 4.5 0 0 1 9 0v.75" />
    </svg>
  );
}

function IconChild({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="8" cy="5" r="2" />
      <path d="M4.5 13.25v-.5a3.5 3.5 0 0 1 7 0v.5" />
      <path d="M5.75 9.25h4.5" />
    </svg>
  );
}

function StepCounter({
  label,
  icon,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  icon: "adult" | "child";
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const btn =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line text-[16px] font-semibold leading-none text-ink transition-colors";
  return (
    <div>
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.04em] text-ink-soft">
        {icon === "adult" ? <IconAdult /> : <IconChild />}
        {label}
      </span>
      <div className="flex items-center gap-1 rounded-lg border-[1.5px] border-line/90 bg-transparent px-1.5 py-1">
        <button
          type="button"
          aria-label={`${label} −`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className={`${btn} disabled:cursor-not-allowed disabled:opacity-30`}
        >
          −
        </button>
        <span className="min-w-[2ch] flex-1 text-center text-[16px] font-bold text-ink">
          {value}
        </span>
        <button
          type="button"
          aria-label={`${label} +`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className={`${btn} disabled:cursor-not-allowed disabled:opacity-30`}
        >
          ＋
        </button>
      </div>
    </div>
  );
}
