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
    <section id="plan" className="scroll-mt-24 bg-paper py-12 md:py-16">
      <div className="page-col">
        <div className="mx-auto max-w-[640px]">
          <div
            role="tablist"
            className="mb-8 flex overflow-hidden rounded-[10px] border-[1.5px] border-line"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "boutique"}
              onClick={() => onTab("boutique")}
              className={`inline-flex h-12 flex-1 items-center justify-center gap-1.5 px-2 text-[13px] font-medium md:text-[14px] ${
                tab === "boutique" ? "bg-cta text-paper" : "bg-transparent text-ink-soft"
              }`}
            >
              🗺️ {t(copy.plan.tabBook)}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "custom"}
              onClick={() => onTab("custom")}
              className={`inline-flex h-12 flex-1 items-center justify-center gap-1.5 px-2 text-[13px] font-medium md:text-[14px] ${
                tab === "custom" ? "bg-cta text-paper" : "bg-transparent text-ink-soft"
              }`}
            >
              ✏️ {t(copy.plan.tabDesign)}
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
