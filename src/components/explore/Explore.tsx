import { useEffect, useState } from "react";
import { destinationVideos } from "@/data/videos";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconClose } from "@/components/icons";

export function Explore() {
  const { t } = useLocale();
  const [active, setActive] = useState<(typeof destinationVideos)[number] | null>(null);

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
    <section id="explore" className="scroll-mt-24 py-14 md:py-16">
      <div className="page-col">
        <h2 className="mt-2 mb-7 text-[22px] leading-[1.3] font-medium text-cta">
          {t(copy.explore.h2)}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {destinationVideos.map((v) => (
            <button
              key={v.id}
              id={v.id}
              type="button"
              onClick={() => setActive(v)}
              className="flex w-full overflow-hidden rounded-[10px] border border-line bg-surface text-left scroll-mt-28"
            >
              <div className="relative w-[120px] min-h-[108px] shrink-0 self-stretch bg-bone">
                <img src={v.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute inset-0 bg-[rgba(16,28,22,0.35)]" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(250,248,242,0.92)] pl-0.5 text-cta">
                    <PlayMark />
                  </span>
                </span>
                <span className="absolute right-1.5 bottom-1.5 rounded-[3px] bg-[rgba(16,28,22,0.75)] px-[5px] py-px text-[10px] text-paper tabular-nums">
                  {v.duration}
                </span>
              </div>
              <div className="min-w-0 flex-1 px-3.5 py-3.5">
                <p className="mb-1.5 text-[10px] font-medium tracking-[0.08em] text-gold">
                  {t(v.location)}
                </p>
                <h3 className="mb-1.5 truncate text-[14px] leading-[1.35] font-medium text-ink">
                  {t(v.title)}
                </h3>
                <p className="line-clamp-2 text-[12px] leading-[18px] text-ink-soft">{t(v.desc)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {active ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,28,22,0.92)] p-4">
          <button
            type="button"
            aria-label={t(copy.nav.close)}
            className="absolute inset-0"
            onClick={() => setActive(null)}
          />
          <button
            type="button"
            aria-label={t(copy.nav.close)}
            onClick={() => setActive(null)}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-paper/20 bg-paper/12 text-paper"
          >
            <IconClose className="h-5 w-5" />
          </button>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t(active.title)}
            className="relative z-10 w-full max-w-[720px] overflow-hidden rounded-lg bg-night"
          >
            <div className="relative flex aspect-video items-center justify-center">
              <img src={active.src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-paper/90 pl-1 text-cta">
                <PlayMark />
              </span>
              <span className="absolute right-3 bottom-3 rounded-[3px] bg-[rgba(16,28,22,0.75)] px-1.5 py-0.5 text-[11px] text-paper tabular-nums">
                {active.duration}
              </span>
            </div>
            <div className="bg-ink px-5 py-4">
              <p className="text-[10px] font-medium tracking-[0.08em] text-gold">{t(active.location)}</p>
              <p className="mt-1 text-[15px] font-medium text-paper">{t(active.title)}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PlayMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M7 4.5 17 10 7 15.5V4.5z" />
    </svg>
  );
}
