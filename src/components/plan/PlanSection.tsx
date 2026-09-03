import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { BookRouteFlow } from "@/components/plan/BookRouteFlow";
import { DesignRouteFlow } from "@/components/plan/DesignRouteFlow";
import type { RouteId } from "@/types";

export function PlanSection({
  tab,
  onTab,
  route,
}: {
  tab: "custom" | "boutique";
  onTab: (tab: "custom" | "boutique") => void;
  route: RouteId;
}) {
  const { t } = useLocale();

  return (
    <section id="plan" className="scroll-mt-24 border-y border-cta/20 bg-bone py-14 md:py-20">
      <div className="page-col">
        <p className="text-[13px] font-medium tracking-[0.16em] text-cta uppercase">
          {t(copy.plan.kicker)}
        </p>
        <h2 className="mt-2 max-w-[720px] text-[26px] leading-tight font-medium text-balance text-ink md:text-[34px]">
          {t(copy.plan.h2)}
        </h2>
        <p className="mt-3 max-w-[640px] text-[14px] leading-[22px] text-ink-soft">
          {t(copy.plan.h2Sub)}
        </p>

        <div className="mx-auto mt-8 max-w-[680px] rounded-2xl border border-line bg-paper p-5 shadow-[0_10px_48px_rgba(47,83,68,0.1)] md:mt-10 md:p-8">
          <div
            role="tablist"
            className="mb-8 flex overflow-hidden rounded-[10px] border-[1.5px] border-line bg-surface"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "boutique"}
              onClick={() => onTab("boutique")}
              className={`inline-flex min-h-12 flex-1 items-center justify-center px-2 py-2 text-center text-[12.5px] leading-[1.3] font-medium md:text-[14px] ${
                tab === "boutique" ? "bg-cta text-paper" : "bg-transparent text-ink-soft"
              }`}
            >
              {t(copy.plan.tabBook)}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "custom"}
              onClick={() => onTab("custom")}
              className={`inline-flex min-h-12 flex-1 items-center justify-center px-2 py-2 text-center text-[12.5px] leading-[1.3] font-medium md:text-[14px] ${
                tab === "custom" ? "bg-cta text-paper" : "bg-transparent text-ink-soft"
              }`}
            >
              {t(copy.plan.tabDesign)}
            </button>
          </div>

          <div className={tab === "boutique" ? "" : "hidden"}>
            <BookRouteFlow route={route} />
          </div>
          <div className={tab === "custom" ? "" : "hidden"}>
            <DesignRouteFlow route={route} />
          </div>
        </div>
      </div>
    </section>
  );
}
