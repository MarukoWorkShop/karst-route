import { useMemo, useState } from "react";
import type { ThemeId, RouteId } from "@/types";
import {
  PREF_IDS,
  type CraftBrief,
  type CraftDraft,
  type PaceId,
  type PrefId,
} from "@/lib/craft";
import { requestDraft } from "@/lib/craftClient";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconSparkles } from "@/components/icons";
import { PlanMagic } from "@/components/plan/PlanMagic";
import { PlanResult } from "@/components/plan/PlanResult";
import { StepBasics, StepBudget, StepPace, StepPrefs } from "@/components/plan/PlanSteps";

const STEPS = [copy.craft.s1, copy.craft.s2, copy.craft.s3, copy.craft.s4] as const;
const SUBS = [copy.craft.s1sub, copy.craft.s2sub, copy.craft.s3sub, copy.craft.s4sub] as const;

export function CustomPlanFlow({
  browsedRoute,
  browsedTheme,
  themeFilterOn,
}: {
  browsedRoute: RouteId;
  browsedTheme: ThemeId;
  themeFilterOn: boolean;
}) {
  const { t, locale } = useLocale();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"ask" | "magic" | "result">("ask");
  const [draft, setDraft] = useState<CraftDraft | null>(null);

  const [startDate, setStartDate] = useState("");
  const [flexible, setFlexible] = useState(false);
  const [days, setDays] = useState(10);
  const [travelers, setTravelers] = useState(2);
  const [pace, setPace] = useState<PaceId | null>(null);
  const [selected, setSelected] = useState<PrefId[]>([...PREF_IDS]);
  const [order, setOrder] = useState<PrefId[]>([...PREF_IDS]);
  const [budgetUsd, setBudgetUsd] = useState(2200);

  const canNext = useMemo(() => {
    if (step === 0) return flexible || /^\d{4}-\d{2}-\d{2}$/.test(startDate);
    if (step === 1) return pace !== null;
    if (step === 2) return selected.length > 0;
    return true;
  }, [step, flexible, startDate, pace, selected.length]);

  function togglePref(id: PrefId) {
    setSelected((cur) => {
      const on = cur.includes(id);
      const next = on ? cur.filter((x) => x !== id) : [...cur, id];
      setOrder((ord) => {
        if (on) return ord.filter((x) => x !== id);
        return [...ord, id];
      });
      return next;
    });
  }

  function reset() {
    setPhase("ask");
    setStep(0);
    setDraft(null);
  }

  async function generate() {
    if (!pace) return;
    const brief: CraftBrief = {
      startDate,
      flexible,
      days,
      travelers,
      pace,
      prefs: order.filter((id) => selected.includes(id)),
      budgetUsd,
      locale,
      implicit: { browsedRoute, browsedTheme, themeFilterOn },
    };
    setPhase("magic");
    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wait = reduce ? 400 : 2200;
    const [out] = await Promise.all([
      requestDraft(brief),
      new Promise((r) => window.setTimeout(r, wait)),
    ]);
    setDraft(out);
    setPhase("result");
  }

  return (
    <section id="plan" className="scroll-mt-24 mx-auto max-w-xl bg-surface px-4 py-16">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-cta/25 bg-cta/8 px-2.5 py-1 text-[10px] font-medium tracking-[0.14em] text-cta">
          <IconSparkles className="h-3.5 w-3.5" />
          {t(copy.craft.badge)}
        </span>
      </div>
      <p className="mt-4 text-[13px] font-medium tracking-[0.16em] text-cta">
        {t(copy.craft.kicker)}
      </p>
      <h2 className="mt-2 text-[22px] leading-8 font-medium">{t(copy.craft.h2)}</h2>
      <p className="mt-2 text-[16px] leading-7 text-ink-soft">{t(copy.craft.sub)}</p>

      {phase === "magic" ? <PlanMagic /> : null}
      {phase === "result" && draft ? <PlanResult draft={draft} onAgain={reset} /> : null}

      {phase === "ask" ? (
        <>
          <div className="mt-8 flex items-center gap-2" aria-hidden>
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full ${i <= step ? "bg-cta" : "bg-line"}`}
              />
            ))}
          </div>
          <p className="mt-3 text-[13px] text-ink-soft">
            {step + 1} {t(copy.craft.stepOf)} {STEPS.length} · {t(STEPS[step]!)}
          </p>
          <h3 className="mt-1 text-[18px] font-medium">{t(STEPS[step]!)}</h3>
          <p className="mt-1 text-[14px] leading-6 text-ink-soft">{t(SUBS[step]!)}</p>

          <div className="mt-6">
            {step === 0 ? (
              <StepBasics
                startDate={startDate}
                flexible={flexible}
                days={days}
                travelers={travelers}
                onStart={setStartDate}
                onFlexible={setFlexible}
                onDays={setDays}
                onTravelers={setTravelers}
              />
            ) : null}
            {step === 1 ? <StepPace pace={pace} onPace={setPace} /> : null}
            {step === 2 ? (
              <StepPrefs
                selected={selected}
                order={order}
                onToggle={togglePref}
                onReorder={setOrder}
              />
            ) : null}
            {step === 3 ? <StepBudget value={budgetUsd} onChange={setBudgetUsd} /> : null}
          </div>

          <div className="mt-8 flex gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="h-12 flex-1 rounded-lg border border-line text-[15px]"
              >
                {t(copy.craft.back)}
              </button>
            ) : null}
            {step < 3 ? (
              <button
                type="button"
                disabled={!canNext}
                onClick={() => setStep((s) => s + 1)}
                className="h-12 flex-1 rounded-lg bg-cta text-[16px] font-medium text-white active:bg-cta-press disabled:opacity-40"
              >
                {t(copy.craft.next)}
              </button>
            ) : (
              <button
                type="button"
                disabled={!canNext}
                onClick={() => void generate()}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-cta text-[16px] font-medium text-white active:bg-cta-press disabled:opacity-40"
              >
                <IconSparkles className="h-4 w-4" />
                {t(copy.craft.generate)}
              </button>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
