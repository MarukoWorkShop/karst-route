import { themes } from "@/data/themes";
import type { ThemeId } from "@/types";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

export function ThemeRail({
  selected,
  onSelect,
}: {
  selected: ThemeId;
  onSelect: (id: ThemeId) => void;
}) {
  const { locale, t } = useLocale();
  return (
    <section id="themes" className="pt-10">
      <p className="px-4 text-[13px] font-medium tracking-[0.16em] text-cta">
        {t(copy.tours.themes)}
      </p>
      <div className="mt-4 flex snap-x-mandatory gap-3 overflow-x-auto px-4 pb-2 md:grid md:grid-cols-4 md:overflow-visible">
        {themes.map((theme) => {
          const on = theme.id === selected;
          const primary = locale === "zh" ? theme.zh.split("・")[0] : theme.en;
          const secondary = locale === "zh" ? theme.en : theme.zh;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelect(theme.id)}
              className="relative h-[min(72vw,280px)] w-[min(82vw,340px)] shrink-0 snap-start overflow-hidden rounded-lg text-left text-white md:h-72 md:w-auto md:max-w-none"
              style={{ background: theme.wash }}
            >
              <img
                src={theme.cover}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute inset-0 bg-linear-to-t from-night/80 via-night/25 to-transparent" />
              <span className="absolute bottom-4 left-4 right-4">
                <span className="block text-[32px] leading-[1.28] font-medium md:text-[40px] md:leading-[1.28]">
                  {primary}
                </span>
                <span className="mt-1 block text-[14px] leading-6 text-white/80">
                  {secondary}
                </span>
              </span>
              {on ? (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-cta" />
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
