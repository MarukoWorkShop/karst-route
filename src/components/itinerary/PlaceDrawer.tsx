import { useEffect, useId, useRef, useState } from "react";
import type { Place } from "@/data/destinations";
import {
  placeStories,
  type PlaceTweak,
} from "@/data/destinations";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconBed, IconBowl, IconCamera, IconChevron, IconClose } from "@/components/icons";

export function PlaceDrawer({
  place,
  city,
  tweak,
  onTweak,
  onClose,
}: {
  place: Place;
  city: string;
  tweak: PlaceTweak;
  onTweak: (patch: Partial<PlaceTweak>) => void;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const story = placeStories[place.id];
  const slides = story.slides;
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  function requestClose() {
    setOpen(false);
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => closeRef.current(), reduce ? 0 : 240);
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
      if (e.key === "ArrowRight") setI((n) => (n + 1) % slides.length);
      if (e.key === "ArrowLeft") setI((n) => (n - 1 + slides.length) % slides.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once on mount
  }, [slides.length]);

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function go(dir: -1 | 1) {
    setI((n) => (n + dir + slides.length) % slides.length);
  }

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button
        type="button"
        aria-label={t(copy.nav.close)}
        className={`absolute inset-0 bg-ink/40 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={requestClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`place-drawer absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-[-16px_0_40px_color-mix(in_srgb,var(--color-ink)_12%,transparent)] ${
          open || reduce ? "is-open" : ""
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
          <p id={titleId} className="text-[16px] font-medium">
            {city}
          </p>
          <button
            type="button"
            autoFocus
            onClick={requestClose}
            className="flex h-11 w-11 items-center justify-center rounded-lg"
            aria-label={t(copy.nav.close)}
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="relative bg-bone">
            <img
              src={slides[i]}
              alt=""
              className="aspect-[16/10] w-full object-cover"
            />
            <p className="absolute bottom-3 left-4 text-[12px] text-white">
              {i + 1} {t(copy.tours.book.of)} {slides.length}
            </p>
            <button
              type="button"
              aria-label={t(copy.tours.book.prev)}
              onClick={() => go(-1)}
              className="absolute top-1/2 left-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg bg-paper/90"
            >
              <IconChevron className="h-5 w-5 rotate-90" />
            </button>
            <button
              type="button"
              aria-label={t(copy.tours.book.next)}
              onClick={() => go(1)}
              className="absolute top-1/2 right-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg bg-paper/90"
            >
              <IconChevron className="h-5 w-5 -rotate-90" />
            </button>
            <div className="absolute bottom-3 right-4 flex gap-1">
              {slides.map((_, n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n + 1}`}
                  onClick={() => setI(n)}
                  className={`h-2 w-2 rounded-full ${n === i ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-8 px-5 py-6">
            <p className="text-[13px] leading-6 text-ink-soft">{t(place.tagline)}</p>

            <section>
              <p className="text-[12px] font-medium tracking-[0.14em] text-cta">
                {t(copy.tours.book.culture)}
              </p>
              <p className="mt-2 text-[15px] leading-7">{t(story.culture)}</p>
            </section>

            <section>
              <p className="flex items-center gap-2 text-[12px] font-medium tracking-[0.14em] text-cta">
                <IconCamera className="h-4 w-4" />
                {t(copy.tours.book.playHow)}
              </p>
              <h4 className="mt-2 text-[16px] font-medium">{t(place.experience.title)}</h4>
              <p className="mt-1 text-[15px] leading-7 text-ink-soft">{t(place.experience.body)}</p>
              <p className="mt-3 flex items-start gap-2 text-[14px] leading-6">
                <IconBowl className="mt-0.5 h-4 w-4 shrink-0 text-cta" />
                <span>
                  <span className="font-medium">{t(place.cuisine.title)}. </span>
                  {t(place.cuisine.body)}
                </span>
              </p>
              <p className="mt-2 flex items-start gap-2 text-[14px] leading-6">
                <IconBed className="mt-0.5 h-4 w-4 shrink-0 text-cta" />
                <span>
                  <span className="font-medium">{t(place.hotel.title)}. </span>
                  {t(place.hotel.body)}
                </span>
              </p>
            </section>

            <section>
              <p className="text-[12px] font-medium tracking-[0.14em] text-cta">
                {t(copy.tours.book.tweaks)}
              </p>
              <p className="mt-2 text-[13px] leading-6 text-ink-soft">
                {t(copy.tours.book.extraNightHint)}
              </p>
              <p className="mt-4 text-[13px] text-ink-soft">{t(copy.tours.book.extraNight)}</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {([0, 1, 2] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={tweak.extraNights === n}
                    data-tweak-nights={n}
                    onClick={() => onTweak({ extraNights: n })}
                    className={`h-11 rounded-lg border text-[13px] font-medium ${
                      tweak.extraNights === n
                        ? "border-cta bg-cta text-white"
                        : "border-line bg-paper"
                    }`}
                  >
                    {n === 0
                      ? t(copy.tours.book.night0)
                      : n === 1
                        ? t(copy.tours.book.night1)
                        : t(copy.tours.book.night2)}
                  </button>
                ))}
              </div>
              <p className="mt-5 text-[13px] text-ink-soft">{t(copy.tours.book.hotelTier)}</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(
                  [
                    ["simple", copy.tours.book.tierSimple],
                    ["comfort", copy.tours.book.tierComfort],
                    ["generous", copy.tours.book.tierGenerous],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={tweak.hotelTier === id}
                    data-tweak-tier={id}
                    onClick={() => onTweak({ hotelTier: id })}
                    className={`h-11 rounded-lg border px-1 text-[12px] font-medium leading-4 ${
                      tweak.hotelTier === id
                        ? "border-cta bg-cta text-white"
                        : "border-line bg-paper"
                    }`}
                  >
                    {t(label)}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </aside>
    </div>
  );
}
