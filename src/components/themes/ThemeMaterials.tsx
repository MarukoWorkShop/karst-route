import { themes } from "@/data/themes";
import type { ThemeId } from "@/types";
import { IconPassport, IconCar, IconHeadset } from "@/components/icons";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

export function ThemeMaterials({ themeId }: { themeId: ThemeId }) {
  const { t } = useLocale();
  const theme = themes.find((item) => item.id === themeId) ?? themes[0];

  return (
    <div className="pt-3">
      <div key={theme.id} className="flex snap-x-mandatory gap-3 overflow-x-auto px-4">
        {theme.materials.map((m) => (
          <div key={m.id} className="snap-start w-[78vw] max-w-sm shrink-0">
            {m.src ? (
              m.kind === "video" ? (
                <video
                  className="aspect-video w-full rounded-lg object-cover"
                  src={m.src}
                  muted
                  loop
                  playsInline
                  poster=""
                />
              ) : (
                <img
                  className="aspect-video w-full rounded-lg object-cover"
                  src={m.src}
                  alt={t(m.caption) || t(m.label)}
                />
              )
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-line bg-bone text-[13px] text-ink-soft">
                {t(m.label)}
                {m.kind === "video" ? "  ▶" : ""}
              </div>
            )}
            {m.caption ? (
              <p className="mt-2 text-[12px] leading-4 text-ink-soft">{t(m.caption)}</p>
            ) : null}
          </div>
        ))}
      </div>
      <p className="mt-4 flex items-center justify-center gap-4 px-4 text-[12px] text-ink-soft">
        <span className="inline-flex items-center gap-1">
          <IconPassport className="h-4 w-4" /> {t(copy.tours.trustBorder)}
        </span>
        <span className="inline-flex items-center gap-1">
          <IconCar className="h-4 w-4" /> {t(copy.tours.trustCar)}
        </span>
        <span className="inline-flex items-center gap-1">
          <IconHeadset className="h-4 w-4" /> {t(copy.tours.trustWa)}
        </span>
      </p>
    </div>
  );
}
