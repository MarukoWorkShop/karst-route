import type { LightId } from "@/types";
import { lightReviewsFor } from "@/data/lightReviews";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

/** 详情右侧：客人自述在上，描述型高光在下。随详情页一起滚动。 */
export function LightReviews({ category }: { category: LightId }) {
  const { t } = useLocale();
  const items = lightReviewsFor(category);
  const notes = items.filter((r) => r.kind === "note");
  const moments = items.filter((r) => r.kind === "photo");

  const heading = "flex items-center gap-2.5 text-[16px] font-semibold tracking-[0.08em] text-ink";

  return (
    <>
      {notes.length > 0 || moments.length === 0 ? (
        <section aria-label={t(copy.light.reviewsTitle)} className="mt-6 border-t border-line pt-5">
          <h4 className={heading}>
            <span className="h-3.5 w-[3px] shrink-0 rounded-full bg-gold" aria-hidden />
            {t(copy.light.reviewsTitle)}
          </h4>
          {notes.length === 0 ? (
            <p className="mt-3 py-6 text-center text-[13px] text-ink-soft">{t(copy.light.reviewsEmpty)}</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {notes.map((r) => (
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
                  <p className="feedback-quote mt-3 text-[15px] leading-8 text-ink">{quote(t(r.body))}</p>
                  {r.photos.length > 0 ? (
                    <div className="mt-3">
                      <PhotoGrid photos={r.photos} framed />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
      {moments.length > 0 ? (
        <section aria-label={t(copy.light.highlightMoments)} className="mt-6 border-t border-line pt-5">
          <h4 className={heading}>
            <span className="h-3.5 w-[3px] shrink-0 rounded-full bg-gold" aria-hidden />
            {t(copy.light.highlightMoments)}
          </h4>
          <ul className="mt-3 flex flex-col gap-3">
            {moments.map((r) => (
              <li
                key={r.id}
                className="overflow-hidden rounded-xl bg-paper shadow-[0_1px_0_rgba(30,51,41,0.06),0_6px_18px_rgba(30,51,41,0.05)] ring-1 ring-line/70"
              >
                <PhotoGrid photos={r.photos} />
                <p className="px-3.5 py-3 text-[13px] leading-6 text-ink">{t(r.body)}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

/** 客人原话包一层弯引号；正文里已经有引号时不再套一层。 */
function quote(text: string) {
  const trimmed = text.trim();
  if (/^[“"「『].*[”"」』]$/s.test(trimmed)) return trimmed;
  return `“${trimmed}”`;
}

function PhotoGrid({ photos, framed }: { photos: string[]; framed?: boolean }) {
  if (!photos.length) return null;
  const cells = photos.map((src) => {
    const wide = src.endsWith("#wide");
    return { src: wide ? src.slice(0, -"#wide".length) : src, wide };
  });
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {cells.map(({ src, wide }, i) => (
        <div
          key={src + i}
          className={`overflow-hidden bg-bone ${framed ? "rounded-lg" : ""} ${
            wide || photos.length === 1
              ? "col-span-2"
              : photos.length === 3 && i === 0
                ? "col-span-2 aspect-[2/1]"
                : photos.length === 5 && i === 4
                  ? "col-span-2 aspect-[4/3]"
                  : "aspect-square"
          }`}
        >
          <img
            loading="lazy"
            src={src}
            alt=""
            className={
              wide || photos.length === 1
                ? "mx-auto max-h-[420px] w-full object-contain"
                : "h-full w-full object-cover"
            }
          />
        </div>
      ))}
    </div>
  );
}
