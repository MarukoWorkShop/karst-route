import { useMemo, useState } from "react";
import type { ThemeId, RouteId } from "@/types";
import {
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
  const [days, setDays] = useState(14);
  const [travelers, setTravelers] = useState(2);
  const [pace, setPace] = useState<PaceId | null>(null);
  const [selected, setSelected] = useState<PrefId[]>([]);
  const [order, setOrder] = useState<PrefId[]>([]);
  const [budgetUsd, setBudgetUsd] = useState(1500);

  const canNext = useMemo(() => {
    if (step === 1) return pace !== null;
    if (step === 2) return selected.length > 0;
    return true;
  }, [step, pace, selected.length]);

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
      flexible: !startDate.trim() || /灵活|flexible/i.test(startDate),
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
    <div>
      {phase === "magic" ? <PlanMagic /> : null}
      {phase === "result" && draft ? <PlanResult draft={draft} onAgain={reset} /> : null}

      {phase === "ask" ? (
        <>
          <div className="mb-6 flex gap-1" aria-hidden>
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-[3px] flex-1 rounded-sm ${i <= step ? "bg-cta" : "bg-line"}`}
              />
            ))}
          </div>
          <h3 className="mb-5 text-[18px] font-medium text-cta">{t(STEPS[step]!)}</h3>

          <div>
            {step === 0 ? (
              <StepBasics
                startDate={startDate}
                days={days}
                travelers={travelers}
                onStart={setStartDate}
                onDays={setDays}
                onTravelers={setTravelers}
              />
            ) : null}
            {step === 1 ? <StepPace pace={pace} onPace={setPace} /> : null}
            {step === 2 ? (
              <StepPrefs selected={selected} onToggle={togglePref} />
            ) : null}
            {step === 3 ? <StepBudget value={budgetUsd} onChange={setBudgetUsd} /> : null}
          </div>

          <div className="mt-7 flex gap-2.5">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="h-12 flex-1 rounded-lg border-[1.5px] border-line text-[15px] font-medium text-ink"
              >
                {t(copy.craft.back)}
              </button>
            ) : null}
            {step < 3 ? (
              <button
                type="button"
                disabled={!canNext}
                onClick={() => setStep((s) => s + 1)}
                className="h-12 flex-[2] rounded-lg bg-cta text-[15px] font-medium text-paper active:bg-cta-press disabled:opacity-40"
              >
                {t(copy.craft.next)}
              </button>
            ) : (
              <button
                type="button"
                disabled={!canNext}
                onClick={() => void generate()}
                className="inline-flex h-12 flex-[2] items-center justify-center gap-2 rounded-lg bg-cta text-[15px] font-medium text-paper active:bg-cta-press disabled:opacity-40"
              >
                <IconSparkles className="h-4 w-4" />
                {t(copy.craft.generate)}
              </button>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
