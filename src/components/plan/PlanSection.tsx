import { IconSparkles } from "@/components/icons";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { CustomPlanFlow } from "@/components/plan/CustomPlanFlow";
import { QuoteForm } from "@/components/form/QuoteForm";
import type { RouteId, ThemeId } from "@/types";

export function PlanSection({
  tab,
  onTab,
  route,
  browsedTheme,
  themeFilterOn,
}: {
  tab: "custom" | "boutique";
  onTab: (tab: "custom" | "boutique") => void;
  route: RouteId;
  browsedTheme: ThemeId;
  themeFilterOn: boolean;
}) {
  const { t } = useLocale();

  return (
    <section id="plan" className="scroll-mt-24 bg-paper py-12 md:py-16">
      <div className="page-col">
        <div className="mx-auto max-w-[640px]">
          <div
            role="tablist"
            className="flex overflow-hidden rounded-lg border-[1.5px] border-line"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "custom"}
              onClick={() => onTab("custom")}
              className={`inline-flex h-11 flex-1 items-center justify-center gap-1.5 px-2 text-[13px] font-medium md:text-[14px] ${
                tab === "custom" ? "bg-cta text-paper" : "bg-transparent text-cta"
              }`}
            >
              <IconSparkles className="h-3.5 w-3.5 shrink-0" />
              {t(copy.plan.pathB)}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "boutique"}
              onClick={() => onTab("boutique")}
              className={`h-11 flex-1 px-2 text-[13px] font-medium md:text-[14px] ${
                tab === "boutique" ? "bg-cta text-paper" : "bg-transparent text-cta"
              }`}
            >
              {t(copy.plan.pathA)}
            </button>
          </div>

          <div className="mt-7">
            {tab === "custom" ? (
              <CustomPlanFlow
                browsedRoute={route}
                browsedTheme={browsedTheme}
                themeFilterOn={themeFilterOn}
              />
            ) : (
              <QuoteForm route={route} presetNotes="" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
