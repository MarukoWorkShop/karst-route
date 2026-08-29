import { useEffect, useState } from "react";
import type { RouteId } from "@/types";
import { routes } from "@/data/itinerary";
import { ADD_ONS, GROUP_TYPES, type DateMode } from "@/data/planOptions";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { labelsOf, sendEnquiry } from "@/lib/enquiry";
import { daysToBrief, downloadBriefPdf, pdfChrome } from "@/lib/briefPdf";
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
  if (id === "r1") return 12;
  if (id === "r2") return 10;
  return null;
}

function endIso(start: string, days: number) {
  return new Date(new Date(start + "T12:00:00").getTime() + (days - 1) * 86400000)
    .toISOString()
    .slice(0, 10);
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
  const [travelers, setTravelers] = useState(2);
  const [groupTypes, setGroupTypes] = useState<string[]>([]);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phase, setPhase] = useState<"ask" | "wait" | "ready">("ask");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfErr, setPdfErr] = useState(false);

  useEffect(() => {
    setBaseRoute(route);
  }, [route]);

  const days = routeDays(baseRoute);
  const autoEnd = dateValue && days ? endIso(dateValue, days) : "";

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
    return [
      { label: t(copy.plan.rowRoute), value: routeLabel(false) },
      { label: t(copy.plan.rowDateMode), value: dateModeLabel() },
      { label: t(copy.plan.rowDates), value: dateDisplay() },
      { label: t(copy.plan.rowPeople), value: `${travelers} ${t(copy.plan.peopleUnit)}` },
      { label: t(copy.plan.rowGroup), value: listOrDash(groups) },
      { label: t(copy.plan.rowAddons), value: extras.length ? extras.join(locale === "zh" ? "、" : ", ") : t(copy.plan.none) },
      { label: t(copy.plan.rowNotes), value: notes.trim() || t(copy.plan.none) },
      { label: t(copy.plan.rowName), value: name.trim() || t(copy.plan.dash) },
      { label: t(copy.plan.rowContact), value: contact.trim() || t(copy.plan.dash) },
    ];
  }

  function briefBody() {
    const rid = baseRoute === "r2" ? "r2" : "r1";
    const lines = briefRows().map((r) => `${r.label}: ${r.value}`);
    lines.push("");
    routes[rid].days.forEach((d, i) => {
      const n = String(d.day || i + 1).padStart(2, "0");
      lines.push(`Day ${n} · ${t(d.city)}`);
      lines.push(`  ${t(d.stay)}`);
      d.bullets.forEach((b) => lines.push(`  · ${t(b)}`));
      if (d.transport) lines.push(`  ${t(copy.tours.book.transport)}: ${t(d.transport)}`);
      if (d.lodging) lines.push(`  ${t(copy.tours.book.stay)}: ${t(d.lodging)}`);
      (d.dining ?? []).forEach((meal) => lines.push(`  ${t(copy.tours.book.dining)}: ${t(meal)}`));
      if (d.drive) lines.push(`  ${t(copy.plan.pdfDrive)}: ${t(d.drive)}`);
      lines.push("");
    });
    return lines.join("\n").trim();
  }

  async function downloadPdf() {
    const rid = baseRoute === "r2" ? "r2" : "r1";
    setPdfBusy(true);
    setPdfErr(false);
    try {
      await downloadBriefPdf({
        filename: rid === "r2" ? "karst-southern-loop-booking.pdf" : "karst-three-realms-booking.pdf",
        kicker: t(copy.plan.summary),
        title: routeLabel(false),
        generated: t(copy.plan.pdfGenerated).replace(
          "{d}",
          new Date().toLocaleString(locale === "zh" ? "zh-CN" : "en-GB"),
        ),
        rows: briefRows(),
        days: daysToBrief(routes[rid].days, t),
        ...pdfChrome(t),
      });
    } catch {
      setPdfErr(true);
    } finally {
      setPdfBusy(false);
    }
  }

  function generate() {
    setPhase("wait");
    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => setPhase("ready"), reduce ? 400 : 2200);
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
      travelers: String(travelers),
      groupTypes: labelsOf(groupTypes, GROUP_TYPES, "en").join(", "),
      addOns: labelsOf(addOns, ADD_ONS, "en").join(", "),
      notes: notes.trim(),
      brief: briefBody(),
    });
    setSending(false);
    if (ok) setSent(true);
    else setError(true);
  }

  if (phase === "wait") {
    return (
      <div className="py-12 text-center">
        <div className="mb-3 text-[32px]" aria-hidden>
          ⏳
        </div>
        <p className="text-[14px] leading-[22px] text-ink-soft">{t(copy.plan.compiling)}</p>
        <div className="mx-auto mt-6 flex max-w-[320px] flex-col gap-2.5" aria-hidden>
          {[100, 80, 92, 65].map((w, i) => (
            <div key={i} className="sk-pulse h-3.5 rounded bg-bone" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (phase === "ready") {
    const groups = labelsOf(groupTypes, GROUP_TYPES, locale);
    const extras = labelsOf(addOns, ADD_ONS, locale);
    const rows: [string, string, boolean?][] = [
      [t(copy.plan.rowRoute), routeLabel(true)],
      [t(copy.plan.rowDates), dateDisplay(), true],
      [t(copy.plan.rowPeople), `${travelers} ${t(copy.plan.peopleUnit)}`],
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
        <div className="mb-1 rounded-xl border border-line bg-surface px-5 pt-5 pb-1">
          <div className="mb-2.5 text-[13px] font-medium tracking-[0.06em] text-gold">
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
              <span className="text-right text-[13px] font-medium leading-5 text-ink">{v}</span>
            </div>
          ))}
          <div className="h-3" />
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          <button
            type="button"
            disabled={pdfBusy}
            onClick={() => void downloadPdf()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-cta bg-transparent text-[15px] font-medium text-cta disabled:opacity-60"
          >
            <IconDownload />
            {pdfBusy ? t(copy.plan.pdfPreparing) : t(copy.plan.downloadPdf)}
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
        <div className="flex flex-col gap-6">
          <div>
            <FieldLabel>{t(copy.plan.chooseRoute)}</FieldLabel>
            <div className="mt-2 flex flex-col gap-2.5">
              {(
                [
                  { val: "r1" as const, title: copy.plan.r1Title, sub: copy.plan.r1Sub },
                  { val: "r2" as const, title: copy.plan.r2Title, sub: copy.plan.r2Sub },
                ] as const
              ).map((r) => {
                const on = baseRoute === r.val;
                return (
                  <OptionBtn key={r.val} active={on} onClick={() => setBaseRoute(r.val)} className="flex items-center gap-3">
                    <RadioDot on={on} />
                    <span>
                      <span className="block text-[14px] font-medium">{t(r.title)}</span>
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
                    onClick={() => setDateMode(dateMode === mode ? "" : mode)}
                    className={`flex-1 rounded-lg border-[1.5px] px-1.5 py-[9px] text-center text-[12px] font-medium ${
                      on ? "border-cta bg-cta/8 text-cta" : "border-line bg-surface text-ink"
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
                  <span className="mb-1 block text-[11px] font-medium text-ink-soft">{t(copy.plan.startDate)}</span>
                  <input
                    type="date"
                    value={dateValue}
                    onChange={(e) => setDateValue(e.target.value)}
                    className={fieldClass}
                  />
                </label>
                {autoEnd ? (
                  <>
                    <div className="pb-3 text-[18px] text-ink-soft">→</div>
                    <div className="flex-1">
                      <span className="mb-1 block text-[11px] font-medium text-ink-soft">
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
              <div className="rounded-lg bg-sage px-3.5 py-2.5 text-[13px] leading-5 text-ink-soft">
                {t(copy.plan.dateBrowseNote)}
              </div>
            ) : null}
          </div>

          <div>
            <FieldLabel>{t(copy.plan.travelersN).replace("{n}", String(travelers))}</FieldLabel>
            <input
              type="range"
              min={1}
              max={20}
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
              className="range-forest mt-2 w-full"
            />
            <div className="mt-1 flex justify-between text-[11px] text-ink-soft">
              <span>1</span>
              <span>20+</span>
            </div>
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
              className="w-full resize-y rounded-lg border-[1.5px] border-line bg-surface px-3.5 py-3 text-[15px] leading-[1.6] text-ink placeholder:text-ink-soft/70 outline-none"
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
          else generate();
        }}
      />
    </div>
  );
}
