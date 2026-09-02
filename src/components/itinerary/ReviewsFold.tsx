import { useEffect, useState } from "react";
import { travelerReviews, type TravelerReview } from "@/data/reviews";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconChevron, IconClose } from "@/components/icons";

const PER_PAGE = 4;

export function ReviewsFold() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [active, setActive] = useState<TravelerReview | null>(null);
  const totalPages = Math.ceil(travelerReviews.length / PER_PAGE);
  const visible = travelerReviews.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <div className="mt-6">
      {/* 展开的评论列表：放在触发按钮之前，按钮粘底部时列表在按钮上方 */}
      {open ? (
        <div className="pb-2 pt-1">
          <div className="flex flex-col gap-2.5">
            {visible.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setActive(r)}
                className="flex w-full items-start gap-3.5 rounded-[10px] border border-line bg-surface p-3.5 text-left"
              >
                <span className="flex w-11 shrink-0 flex-col items-center gap-1">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-line bg-sage text-[22px] leading-none">
                    {r.flag}
                  </span>
                  <span className="text-center text-[10.5px] leading-[14px] text-ink-soft">
                    {r.name.split(" ")[0]}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] tracking-widest text-gold">
                      {"★".repeat(r.rating)}
                    </span>
                    <span className="text-[10px] text-ink-soft">{t(r.route)}</span>
                    <span className="text-[10px] text-line">·</span>
                    <span className="text-[10px] text-ink-soft">{r.date}</span>
                  </span>
                  <span className="line-clamp-2 text-[13px] leading-5 text-ink">{t(r.short)}</span>
                  <span className="mt-1.5 block text-[11px] text-cta">{t(copy.tours.book.readFull)}</span>
                </span>
              </button>
            ))}
          </div>
          {totalPages > 1 ? (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setPage((p) => (p + 1) % totalPages)}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-sage px-4 py-[7px] text-[12px] text-ink-soft"
              >
                <RefreshMark />
                {t(copy.tours.book.moreReviews)}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* 触发按钮：放在整条线路模块底部，每条线路只显示一次 */}
      <div className="pt-1 pb-1">
        <div className="text-center">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className={`inline-flex items-center gap-1.5 border-b pb-px text-[13px] ${
              open ? "border-cta text-cta" : "border-line text-ink-soft"
            }`}
          >
            <StarMark />
            {t(copy.tours.book.readReviews)}
            <IconChevron className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {active ? (
        <div className="fixed inset-0 z-50" role="presentation">
          <button
            type="button"
            aria-label={t(copy.nav.close)}
            className="absolute inset-0 bg-night/50 backdrop-blur-[2px]"
            onClick={() => setActive(null)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            className="place-drawer is-open absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col overflow-y-auto bg-paper px-[22px] pt-14 pb-12"
          >
            <div className="mb-6 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-line bg-sage text-[28px]">
                  {active.flag}
                </span>
                <div>
                  <p className="text-[15px] font-medium text-ink">{active.name}</p>
                  <p className="mt-0.5 text-[12px] text-ink-soft">{active.country}</p>
                </div>
              </div>
              <button
                type="button"
                aria-label={t(copy.nav.close)}
                onClick={() => setActive(null)}
                className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-line bg-sage"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-[18px] flex flex-wrap items-center gap-2.5">
              <span className="text-[14px] tracking-[0.2em] text-gold">{"★".repeat(active.rating)}</span>
              <span className="rounded-full border border-cta px-2.5 py-0.5 text-[11px] font-medium text-cta opacity-80">
                {t(active.route)}
              </span>
              <span className="text-[11px] text-ink-soft">{active.date}</span>
            </div>
            <div className="mb-5 h-px bg-line" />
            <p className="text-[14.5px] leading-7 text-ink">{t(active.full)}</p>
            {active.photos.length > 0 ? (
              <div className="mt-7">
                <div className="mb-4 h-px bg-line" />
                <p className="mb-3 text-[10px] tracking-[0.08em] text-ink-soft uppercase">
                  {t(copy.tours.book.tripPhotos)}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {active.photos.map((src, i) => (
                    <div
                      key={src + i}
                      className={`overflow-hidden rounded-lg bg-bone ${
                        active.photos.length === 3 && i === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"
                      }`}
                    >
                      <img loading="lazy" src={src} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function StarMark() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden>
      <path d="M6.5 1.5l1.35 2.74 3.02.44-2.19 2.13.52 3.02L6.5 8.25l-2.7 1.58.52-3.02L2.13 4.68l3.02-.44z" />
    </svg>
  );
}

function RefreshMark() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M2 6.5A4.5 4.5 0 0 1 10.5 3.5M10.5 3.5V6M10.5 3.5H8" />
      <path d="M11 6.5A4.5 4.5 0 0 1 2.5 9.5M2.5 9.5V7M2.5 9.5H5" />
    </svg>
  );
}
