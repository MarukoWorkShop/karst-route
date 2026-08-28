import type { ReactNode } from "react";
import type { Place } from "@/data/destinations";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconBed, IconBowl, IconCamera } from "@/components/icons";

export function DestinationCard({
  place,
  city,
  active,
  mark,
  onSelect,
}: {
  place: Place;
  city: string;
  active: boolean;
  mark: "desktop" | "mobile";
  onSelect: () => void;
}) {
  const { t } = useLocale();
  const attr =
    mark === "desktop"
      ? { "data-place-card-desktop": place.id }
      : { "data-place-card-mobile": place.id };
  return (
    <button
      type="button"
      {...attr}
      aria-pressed={active}
      aria-label={t(copy.tours.book.openStop)}
      onClick={onSelect}
      className={`place-card w-full overflow-hidden rounded-lg border bg-surface text-left ${
        active ? "is-focus" : "border-line"
      }`}
    >
      <div className="px-4 pt-3 pb-1">
        <h3 className={`text-[16px] leading-6 ${active ? "font-medium" : "font-normal"}`}>
          {city}
          <span className="mt-0.5 block text-[13px] font-normal text-ink-soft">
            {t(place.tagline)}
          </span>
        </h3>
      </div>
      <img
        src={place.photo}
        alt=""
        className="aspect-[16/9] w-full object-cover"
      />
      <ul className="divide-y divide-line">
        <InfoRow
          icon={<IconCamera className="h-4 w-4" />}
          label={t(copy.tours.book.experience)}
          value={t(place.experience.title)}
          heavy={active}
        />
        <InfoRow
          icon={<IconBowl className="h-4 w-4" />}
          label={t(copy.tours.book.cuisine)}
          value={t(place.cuisine.title)}
          heavy={active}
        />
        <InfoRow
          icon={<IconBed className="h-4 w-4" />}
          label={t(copy.tours.book.hotel)}
          value={t(place.hotel.title)}
          thumb={place.hotel.photo}
          heavy={active}
        />
      </ul>
    </button>
  );
}

function InfoRow({
  icon,
  label,
  value,
  thumb,
  heavy,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  thumb?: string;
  heavy?: boolean;
}) {
  return (
    <li className="flex min-h-12 items-center gap-3 px-4 py-2.5">
      <span className="text-cta" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] tracking-wide text-ink-soft">{label}</span>
        <span className={`block truncate text-[14px] leading-6 ${heavy ? "font-medium" : ""}`}>
          {value}
        </span>
      </span>
      {thumb ? (
        <img src={thumb} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
      ) : null}
    </li>
  );
}
