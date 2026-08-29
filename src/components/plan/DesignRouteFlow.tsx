import { useEffect, useState } from "react";
import type { RouteId } from "@/types";
import { routes } from "@/data/itinerary";
import {
  EXTRA_DESTS,
  HOTEL_TIERS,
  SPECIAL_EXPS,
  TRANSPORT_PREFS,
  type HotelTierId,
} from "@/data/planOptions";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { labelsOf, sendEnquiry } from "@/lib/enquiry";
import { daysToBrief, downloadBriefPdf, pdfChrome } from "@/lib/briefPdf";
import { IconChevron, IconSparkles } from "@/components/icons";
import {
  Chip,
  ConciergeForm,
  FieldLabel,
  IconDownload,
  IconRestart,
  NavRow,
  OptionBtn,
  Progress,
  SentNote,
  StartOver,
  StepKicker,
} from "@/components/plan/PlanUi";

function toggle(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

const SKEL = [
  [copy.plan.sk1, 88],
  [copy.plan.sk2, 72],
  [copy.plan.sk3, 95],
  [copy.plan.sk4, 60],
  [copy.plan.sk5, 80],
] as const;

export function DesignRouteFlow({ route }: { route: RouteId }) {
  const { t, locale } = useLocale();
  const [step, setStep] = useState(0);
  const [baseRoute, setBaseRoute] = useState<RouteId | "">(route);
  const [duration, setDuration] = useState(route === "r2" ? 10 : 12);
  const [extraDests, setExtraDests] = useState<string[]>([]);
  const [hotelTier, setHotelTier] = useState<HotelTierId | "">("");
  const [transport, setTransport] = useState<string[]>([]);
  const [special, setSpecial] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phase, setPhase] = useState<"ask" | "wait" | "itin" | "done">("ask");
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfErr, setPdfErr] = useState(false);

  useEffect(() => {
    setBaseRoute(route);
    setDuration(route === "r2" ? 10 : 12);
  }, [route]);

  const rid: RouteId = baseRoute === "r2" ? "r2" : "r1";
  const days = routes[rid].days.slice(0, duration);

  function listOrDash(items: string[]) {
    const sep = locale === "zh" ? "、" : ", ";
    return items.length ? items.join(sep) : t(copy.plan.dash);
  }

  function briefRows() {
    const hotel = HOTEL_TIERS.find((h) => h.id === hotelTier);
    const sep = locale === "zh" ? "、" : ", ";
    return [
      {
        label: t(copy.plan.rowRoute),
        value: t(baseRoute === "r2" ? copy.plan.r2Title : copy.plan.r1Title),
      },
      { label: t(copy.plan.rowDuration), value: `${duration} ${t(copy.plan.daysUnit)}` },
      {
        label: t(copy.plan.rowExtra),
        value: extraDests.length ? labelsOf(extraDests, EXTRA_DESTS, locale).join(sep) : t(copy.plan.none),
      },
      {
        label: t(copy.plan.rowHotel),
        value: hotel ? `${t(hotel.label)} — ${t(hotel.sub)}` : t(copy.plan.dash),
      },
      { label: t(copy.plan.rowTransportPref), value: listOrDash(labelsOf(transport, TRANSPORT_PREFS, locale)) },
      { label: t(copy.plan.rowSpecial), value: listOrDash(labelsOf(special, SPECIAL_EXPS, locale)) },
      { label: t(copy.plan.rowNotes), value: notes.trim() || t(copy.plan.none) },
      { label: t(copy.plan.rowName), value: name.trim() || t(copy.plan.dash) },
      { label: t(copy.plan.rowContact), value: contact.trim() || t(copy.plan.dash) },
    ];
  }

  function briefBody() {
    const lines = briefRows().map((r) => `${r.label}: ${r.value}`);
    lines.push("");
    days.forEach((d, i) => {
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
    setPdfBusy(true);
    setPdfErr(false);
    try {
      await downloadBriefPdf({
        filename: rid === "r2" ? "karst-southern-loop-custom.pdf" : "karst-three-realms-custom.pdf",
        kicker: t(copy.plan.aiReady),
        title: t(baseRoute === "r2" ? copy.plan.customR2 : copy.plan.customR1),
        generated: t(copy.plan.pdfGenerated).replace(
          "{d}",
          new Date().toLocaleString(locale === "zh" ? "zh-CN" : "en-GB"),
        ),
        rows: briefRows(),
        days: daysToBrief(days, t),
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
    window.setTimeout(() => {
      setOpenDay(null);
      setPhase("itin");
    }, reduce ? 400 : 2800);
  }

  async function submit() {
    if (name.trim().length < 2 || !contact.trim()) {
      setError(true);
      return;
    }
    setError(false);
    setSending(true);
    const hotel = HOTEL_TIERS.find((h) => h.id === hotelTier);
    const ok = await sendEnquiry({
      subject: `New Karst Route custom itinerary — ${rid}`,
      name: name.trim(),
      contact: contact.trim(),
      path: "design",
      route: rid,
      duration: String(duration),
      hotel: hotel ? hotel.label.en : "",
      extraDests: labelsOf(extraDests, EXTRA_DESTS, "en").join(", "),
      transport: labelsOf(transport, TRANSPORT_PREFS, "en").join(", "),
      special: labelsOf(special, SPECIAL_EXPS, "en").join(", "),
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
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-cta px-3 py-1 text-[11px] font-medium tracking-[0.08em] text-cta">
          <IconSparkles className="h-3.5 w-3.5" />
          {t(copy.plan.aiPlanning)}
        </div>
        <p className="mx-auto mb-7 max-w-[260px] text-[14px] leading-[22px] text-ink-soft">
          {t(copy.plan.rebuilding)}
        </p>
        <div className="mx-auto flex max-w-[420px] flex-col gap-3" aria-hidden>
          {SKEL.map(([label, w], i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-[140px] shrink-0 text-right text-[12px] text-ink-soft">{t(label)}</div>
              <div className="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-bone">
                <div className="sk-pulse h-full rounded-[3px] bg-cta/60" style={{ width: `${w}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "itin") {
    return (
      <div>
        <div className="mb-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-ok px-2.5 py-[3px] text-[11px] font-medium tracking-[0.08em] text-ok">
            <IconSparkles className="h-3 w-3" /> {t(copy.plan.aiReady)}
          </span>
        </div>
        <h3 className="mb-1 text-[17px] font-medium">
          {t(baseRoute === "r2" ? copy.plan.customR2 : copy.plan.customR1)}
        </h3>
        <p className="mb-5 text-[12.5px] leading-[19px] text-ink-soft">
          {t(copy.plan.customLead).replace("{n}", String(duration))}
        </p>
        <div className="mb-5 overflow-hidden rounded-xl border border-line">
          {days.map((day, idx) => {
            const isOpen = openDay === idx;
            const isActive = idx < Math.ceil(days.length * 0.6);
            const num = String(day.day || idx + 1).padStart(2, "0");
            return (
              <div key={`${day.day}-${idx}`} className={idx > 0 ? "border-t border-line" : ""}>
                <button
                  type="button"
                  onClick={() => setOpenDay(isOpen ? null : idx)}
                  className={`flex w-full items-center gap-3 px-4 py-[13px] text-left ${
                    isOpen ? "bg-cta/4" : "bg-surface"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-semibold ${
                      isActive ? "border-cta text-cta" : "border-line text-ink-soft"
                    }`}
                  >
                    {num}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[14px] font-medium ${isActive ? "text-ink" : "text-ink-soft"}`}>
                      {t(day.city)}
                    </span>
                    {!isOpen && day.bullets[0] ? (
                      <span className="mt-px block truncate text-[12px] text-ink-soft">{t(day.bullets[0])}</span>
                    ) : null}
                  </span>
                  <span className="mr-1 hidden shrink-0 text-[11px] text-ink-soft sm:inline">{t(day.stay)}</span>
                  <IconChevron
                    className={`h-3.5 w-3.5 shrink-0 text-ink-soft transition-transform duration-150 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen ? (
                  <div className="px-4 pb-4 pl-[60px]">
                    {day.bullets.map((b, bi) => (
                      <div key={bi} className="mb-1.5 flex items-start gap-2">
                        <span className="mt-[3px] shrink-0 text-[12px] text-cta">·</span>
                        <span className="text-[13px] leading-5 text-ink">{t(b)}</span>
                      </div>
                    ))}
                    {day.drive ? (
                      <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-bone px-2.5 py-1 text-[11.5px] text-ink-soft">
                        🚗 {t(day.drive)}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => {
              setPhase("ask");
              setStep(0);
            }}
            className="inline-flex h-[46px] flex-1 items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-line text-[14px] font-medium text-ink"
          >
            <IconRestart />
            {t(copy.plan.keepAdjust)}
          </button>
          <button
            type="button"
            onClick={() => setPhase("done")}
            className="h-[46px] flex-[2] rounded-lg bg-cta text-[14px] font-medium text-paper"
          >
            ✓ {t(copy.plan.confirmItin)}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div>
        <div className="px-0 pt-8 pb-5 text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-ok px-3 py-1 text-[11px] font-medium tracking-[0.08em] text-ok">
            ✓ {t(copy.plan.itinConfirmed)}
          </div>
          <p className="text-[13px] leading-5 text-ink-soft">{t(copy.plan.confirmLead)}</p>
        </div>
        <button
          type="button"
          disabled={pdfBusy}
          onClick={() => void downloadPdf()}
          className="mb-2.5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-cta text-[15px] font-medium text-cta disabled:opacity-60"
        >
          <IconDownload />
          {pdfBusy ? t(copy.plan.pdfPreparing) : t(copy.plan.downloadItin)}
        </button>
        {pdfErr ? <p className="mb-2.5 text-center text-[13px] text-danger">{t(copy.plan.pdfFailed)}</p> : null}
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

  const extraNote =
    extraDests.length === 1
      ? t(copy.plan.extraPickedOne).replace("{days}", String(duration + extraDests.length))
      : t(copy.plan.extraPicked)
          .replace("{n}", String(extraDests.length))
          .replace("{days}", String(duration + extraDests.length));

  return (
    <div>
      <p className="mb-5 text-[13px] leading-5 text-ink-soft">{t(copy.plan.designLead)}</p>
      <Progress step={step} total={5} />
      <StepKicker>{copy.plan.designSteps[step] ? t(copy.plan.designSteps[step]) : null}</StepKicker>

      {step === 0 ? (
        <div className="flex flex-col gap-2.5">
          {(
            [
              { val: "r1" as const, days: 12, title: copy.plan.r1Title, sub: copy.plan.r1SubLong },
              { val: "r2" as const, days: 10, title: copy.plan.r2Title, sub: copy.plan.r2SubLong },
            ] as const
          ).map((r) => {
            const on = baseRoute === r.val;
            return (
              <OptionBtn
                key={r.val}
                active={on}
                onClick={() => {
                  setBaseRoute(r.val);
                  setDuration(r.days);
                }}
              >
                <div className="mb-[3px] font-medium">{t(r.title)}</div>
                <div className={`text-[12px] ${on ? "text-cta" : "text-ink-soft"}`}>{t(r.sub)}</div>
              </OptionBtn>
            );
          })}
          <div className="mt-2">
            <FieldLabel>{t(copy.plan.totalDays).replace("{n}", String(duration))}</FieldLabel>
            <input
              type="range"
              min={8}
              max={18}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="range-forest mt-2 w-full"
            />
            <div className="mt-1 flex justify-between text-[11px] text-ink-soft">
              <span>{t(copy.plan.daysMin)}</span>
              <span>{t(copy.plan.daysMax)}</span>
            </div>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
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
            <div className="mt-3.5 rounded-lg bg-sage px-3.5 py-2.5 text-[12px] text-ink-soft">{extraNote}</div>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-2.5">
          {HOTEL_TIERS.map((tier) => {
            const on = hotelTier === tier.id;
            return (
              <OptionBtn key={tier.id} active={on} onClick={() => setHotelTier(tier.id)}>
                <div className="mb-0.5 font-medium">{t(tier.label)}</div>
                <div className={`text-[12px] ${on ? "text-cta" : "text-ink-soft"}`}>{t(tier.sub)}</div>
              </OptionBtn>
            );
          })}
        </div>
      ) : null}

      {step === 3 ? (
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

      {step === 4 ? (
        <div>
          <p className="mb-4 text-[13px] text-ink-soft">{t(copy.plan.expHint)}</p>
          <div className="mb-5 flex flex-wrap gap-2.5">
            {SPECIAL_EXPS.map((e) => (
              <Chip
                key={e.id}
                active={special.includes(e.id)}
                onClick={() => setSpecial((cur) => toggle(cur, e.id))}
              >
                {t(e.label)}
              </Chip>
            ))}
          </div>
          <label className="block">
            <FieldLabel>{t(copy.plan.moreIdeas)}</FieldLabel>
            <textarea
              rows={3}
              value={notes}
              placeholder={t(copy.plan.moreIdeasPh)}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 w-full resize-y rounded-lg border-[1.5px] border-line bg-surface px-3.5 py-3 text-[15px] leading-[1.6] text-ink placeholder:text-ink-soft/70 outline-none"
            />
          </label>
        </div>
      ) : null}

      <NavRow
        step={step}
        total={5}
        lastLabel={t(copy.plan.genDesign)}
        onBack={() => setStep((s) => s - 1)}
        onNext={() => {
          if (step < 4) setStep((s) => s + 1);
          else generate();
        }}
      />
    </div>
  );
}
