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
      <div className="mt-4 flex snap-x-mandatory gap-3 overflow-x-auto px-4 pb-2 md:grid md:grid-cols-5 md:overflow-visible">
        {themes.map((theme, i) => {
          const on = theme.id === selected;
          const primary = locale === "zh" ? theme.zh : theme.en;
          const secondary = locale === "zh" ? theme.en : theme.zh;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelect(theme.id)}
              className={`relative h-[min(72vw,280px)] w-[min(82vw,340px)] shrink-0 snap-start overflow-hidden rounded-lg text-left text-white md:h-64 md:w-auto md:max-w-none ${
                i === 0 ? "md:col-span-2" : "md:col-span-1"
              }`}
              style={{ background: theme.wash }}
            >
              <span className="absolute inset-0 bg-night/35" />
              <span className="absolute bottom-4 left-4 right-4">
                <span className="block text-[32px] leading-[1.28] font-medium md:text-[40px] md:leading-[1.28]">
                  {primary}
                </span>
                <span className="mt-1 block text-[14px] leading-6">{secondary}</span>
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
