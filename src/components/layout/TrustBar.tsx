import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { reviewStats } from "@/data/reviews";

/** 信任信号条：紧接 Hero 之后。第一项是聚合评分，其余是可信度信号 */
export function TrustBar() {
  const { t } = useLocale();

  const ratingLabel = t(copy.trust.rating)
    .replace("{avg}", reviewStats.average.toFixed(1))
    .replace("{n}", String(reviewStats.count));

  const items: { icon: string; label: string; highlight?: boolean }[] = [
    { icon: "⭐", label: ratingLabel, highlight: true },
    { icon: "🕰️", label: t(copy.trust.years) },
    { icon: "🧳", label: t(copy.trust.travellers) },
    { icon: "🎓", label: t(copy.trust.guide) },
    { icon: "🛡️", label: t(copy.trust.insurance) },
    { icon: "↩️", label: t(copy.trust.cancel) },
  ];

  return (
    <section className="border-y border-line bg-sage">
      <div className="page-col py-3.5">
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:gap-x-9">
          {items.map((item) => (
            <li
              key={item.label}
              className={`flex items-center gap-1.5 text-[12px] font-medium md:text-[13px] ${
                item.highlight ? "text-cta" : "text-ink"
              }`}
            >
              <span className="text-[13px]" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
