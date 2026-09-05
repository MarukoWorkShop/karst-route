import { useEffect, useState } from "react";
import type { RouteId } from "@/types";
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
import {
  Chip,
  ConciergeForm,
  FieldLabel,
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

export function DesignRouteFlow({ route }: { route: RouteId }) {
  const { t, locale } = useLocale();
  const [step, setStep] = useState(0);
  const [baseRoute, setBaseRoute] = useState<RouteId | "">(route);
  const [duration, setDuration] = useState(defaultDays(route));
  const [extraDests, setExtraDests] = useState<string[]>([]);
  const [hotelTier, setHotelTier] = useState<HotelTierId | "">("");
  const [transport, setTransport] = useState<string[]>([]);
  const [special, setSpecial] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phase, setPhase] = useState<"ask" | "contact">("ask");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setBaseRoute(route);
    setDuration(defaultDays(route));
  }, [route]);

  const rid = asRoute(baseRoute);
  const daysRange = durationRange(rid);

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
        value: t(routeTitle(rid)),
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
    setSending(true);
    const hotel = HOTEL_TIERS.find((h) => h.id === hotelTier);
    const ok = await sendEnquiry({
      subject: `New custom route request — ${rid}`,
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

  function restart() {
    setPhase("ask");
    setSent(false);
    setStep(0);
    setError(false);
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
                <span className="text-right text-[13px] font-semibold leading-5 text-ink">{r.value}</span>
              </div>
            ))}
        </div>
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
      <Progress step={step} total={5} />
      <StepKicker>{copy.plan.designSteps[step] ? t(copy.plan.designSteps[step]) : null}</StepKicker>

      {step === 0 ? (
        <div className="flex flex-col gap-2.5">
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
          <div className="mt-2">
            <FieldLabel>{t(copy.plan.totalDays).replace("{n}", String(duration))}</FieldLabel>
            <input
              type="range"
              min={daysRange.min}
              max={daysRange.max}
              value={Math.min(Math.max(duration, daysRange.min), daysRange.max)}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="range-forest mt-2 w-full"
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
            <div className="mt-3.5 rounded-lg bg-paper/60 px-3.5 py-2.5 text-[12px] text-ink-soft">{extraNote}</div>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
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
              className="mt-1.5 w-full resize-y rounded-lg border-[1.5px] border-line/90 bg-paper/70 px-3.5 py-3 text-[15px] leading-[1.6] text-ink placeholder:text-ink-soft/70 outline-none"
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
          else setPhase("contact");
        }}
      />
    </div>
  );
}
