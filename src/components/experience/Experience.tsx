import { useEffect, useId, useState } from "react";
import { themes } from "@/data/themes";
import { experienceCover, experienceDetails } from "@/data/experiences";
import type { ThemeId } from "@/types";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconClose } from "@/components/icons";

export function Experience({
  openId,
  onOpenId,
}: {
  openId?: ThemeId | null;
  onOpenId?: (id: ThemeId | null) => void;
}) {
  const { locale, t } = useLocale();
  const zh = locale === "zh";
  const [internalId, setInternalId] = useState<ThemeId | null>(null);
  const activeId = openId !== undefined ? openId : internalId;
  const setActiveId = onOpenId ?? setInternalId;
  const theme = themes.find((item) => item.id === activeId);
  const detail = activeId ? experienceDetails[activeId] : null;
  const titleId = useId();

  useEffect(() => {
    if (!activeId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [activeId]);

  return (
    <section id="experience" className="scroll-mt-24 bg-paper py-14 md:py-16">
      <div className="page-col">
        <h2 className="text-[22px] leading-7 font-medium text-cta">{t(copy.experience.h2)}</h2>
        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {themes.map((item) => {
            const main = zh ? item.zh.split("・")[0] : item.en;
            const sub = zh ? (item.zh.split("・")[1] ?? "") : item.zh;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveId(item.id);
                }}
                className="relative aspect-[3/4] overflow-hidden rounded-[10px] text-left"
              >
                <img
                  src={experienceCover[item.id]}
                  alt={main}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute inset-0 bg-linear-to-t from-night/80 via-night/20 to-transparent" />
                <span className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-surface/15 backdrop-blur-sm">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path
                      d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5"
                      stroke="#FAF8F2"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
                <span className="absolute right-3.5 bottom-3.5 left-3.5">
                  <span className="block text-[15px] leading-snug font-medium text-surface md:text-base">
                    {main}
                  </span>
                  {sub ? (
                    <span className="mt-0.5 block text-[11px] text-surface/65">{sub}</span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeId && theme && detail ? (
        <div className="fixed inset-0 z-50" role="presentation">
          <button
            type="button"
            aria-label={t(copy.nav.close)}
            className="absolute inset-0 bg-ink/50"
            onClick={() => setActiveId(null)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="place-drawer is-open absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col overflow-y-auto bg-paper"
          >
            <div className="relative aspect-[4/3] shrink-0">
              <img
                src={experienceCover[theme.id]}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-night/60 to-transparent" />
              <button
                type="button"
                aria-label={t(copy.nav.close)}
                onClick={() => setActiveId(null)}
                className="absolute top-3.5 right-3.5 flex h-9 w-9 items-center justify-center rounded-full border border-surface/20 bg-ink/50 text-surface"
              >
                <IconClose className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-5 right-5">
                <p className="text-[11px] tracking-[0.1em] text-surface/60 uppercase">
                  {t(copy.experience.kicker)}
                </p>
                <h3 id={titleId} className="mt-1 text-[26px] leading-tight font-medium text-surface">
                  {zh ? theme.zh.split("・")[0] : theme.en}
                </h3>
              </div>
            </div>
            <div className="px-5 pt-6 pb-10">
              <p className="mb-4 text-[13px] text-ink-soft">{theme.zh}</p>
              <p className="text-[14px] leading-[26px] text-ink">{t(detail.desc)}</p>
              <div className="mt-7 border-t border-line pt-5">
                <p className="mb-3.5 text-[11px] tracking-[0.08em] text-ink-soft uppercase">
                  {t(copy.experience.highlights)}
                </p>
                <ul className="flex flex-col gap-3.5">
                  {detail.highlights.map((h) => (
                    <li key={h.en} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cta" />
                      <span className="text-[13.5px] leading-snug text-ink">{t(h)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Stories stories={detail.stories} />
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}

function Stories({
  stories,
}: {
  stories: { title: { en: string; zh: string }; body: { en: string; zh: string }; by: { en: string; zh: string } }[];
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mt-6 border-t border-line pt-5">
      <p className="mb-3.5 text-[11px] tracking-[0.08em] text-ink-soft uppercase">
        {t(copy.experience.stories)}
      </p>
      {stories.map((story, i) => {
        const isOpen = open === i;
        return (
          <div key={story.title.en} className={i > 0 ? "border-t border-line" : ""}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-start justify-between gap-3 py-3 text-left"
            >
              <span className="flex-1">
                <span
                  className={`block text-[13.5px] leading-snug font-medium ${
                    isOpen ? "text-cta" : "text-ink"
                  }`}
                >
                  {t(story.title)}
                </span>
                {!isOpen ? (
                  <span className="mt-1 block text-[11px] text-ink-soft">{t(story.by)}</span>
                ) : null}
              </span>
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[14px] leading-none ${
                  isOpen
                    ? "border-[1.5px] border-cta bg-cta text-surface"
                    : "border-[1.5px] border-line text-ink-soft"
                }`}
              >
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen ? (
              <div className="pb-4">
                <p className="text-[13px] leading-6 text-ink-soft">{t(story.body)}</p>
                <p className="mt-2 text-[11px] text-ink-soft">{t(story.by)}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
