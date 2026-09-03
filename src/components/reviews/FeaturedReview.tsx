import { travelerReviews } from "@/data/reviews";
import { useLocale } from "@/i18n/LocaleProvider";

/**
 * 首屏下方的社会证明。
 * 选一条最能打消「跨境 = 麻烦」顾虑的真实评价（过境顺利 + 向导专业）。
 */
const featured =
  travelerReviews.find((r) => r.id === "michelle") ?? travelerReviews[0];

export function FeaturedReview() {
  const { t } = useLocale();
  if (!featured) return null;

  return (
    <section className="border-b border-line bg-paper">
      <div className="page-col py-4 md:py-5">
        <div className="mx-auto flex max-w-[760px] items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-sage text-[18px]"
            aria-hidden
          >
            {featured.flag}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[13px] font-medium text-ink">{featured.name}</span>
              <span className="text-[11px] text-ink-soft">{featured.country}</span>
              <span className="text-[11px] tracking-[0.1em] text-gold" aria-hidden>
                {"★".repeat(featured.rating)}
              </span>
              <span className="sr-only">
                {featured.rating} / 5
              </span>
              <span className="rounded-full bg-sage px-2 py-px text-[10px] text-ink-soft">
                {t(featured.route)}
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-[21px] text-ink-soft">
              {t(featured.short)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
