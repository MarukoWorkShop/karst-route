import type { LightId } from "@/types";
import { lightReviewsFor } from "@/data/lightReviews";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

/** 详情右侧评论：每条独立轻卡片，随详情页一起滚动 */
export function LightReviews({ category }: { category: LightId }) {
  const { t } = useLocale();
  const items = lightReviewsFor(category);

  return (
    <section aria-label={t(copy.light.reviewsTitle)} className="mt-6">
      <p className="type-sub font-medium text-ink">{t(copy.light.reviewsTitle)}</p>
      {items.length === 0 ? (
        <p className="mt-3 py-6 text-center text-[13px] text-ink-soft">{t(copy.light.reviewsEmpty)}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {items.map((r) => (
            <li
              key={r.id}
              className="rounded-xl bg-paper px-3.5 py-3.5 shadow-[0_1px_0_rgba(30,51,41,0.06),0_6px_18px_rgba(30,51,41,0.05)] ring-1 ring-line/70"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage text-[20px] leading-none text-ink-soft">
                  {r.flag}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-ink">{r.name}</p>
                  {r.country ? <p className="mt-0.5 text-[12px] text-ink-soft">{r.country}</p> : null}
                  <p className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[12px] tracking-widest text-gold">{"★".repeat(r.rating)}</span>
                    {r.date ? <span className="text-[11px] text-ink-soft">{r.date}</span> : null}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[14px] leading-7 text-ink">{t(r.body)}</p>
              {r.photos.length > 0 ? (
                <div className="mt-3">
                  <p className="type-aux mb-2 text-ink-soft">{t(copy.tours.book.tripPhotos)}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {r.photos.map((src, i) => (
                      <div
                        key={src + i}
                        className={`overflow-hidden rounded-lg bg-bone ${
                          r.photos.length === 3 && i === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"
                        }`}
                      >
                        <img loading="lazy" src={src} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
