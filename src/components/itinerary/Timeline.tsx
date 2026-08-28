import { useState } from "react";
import type { DayStop, PlaceId, RouteId, StayKind, ThemeId } from "@/types";
import { routes } from "@/data/itinerary";
import { defaultTweak, places, type PlaceTweak } from "@/data/destinations";
import { IconChevron } from "@/components/icons";
import { copy, type Tx } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { DestinationCard } from "@/components/itinerary/DestinationCard";
import { PlaceDrawer } from "@/components/itinerary/PlaceDrawer";
import { RouteAside } from "@/components/itinerary/RouteAside";
import { RoutePlayer } from "@/components/itinerary/RoutePlayer";

const stayCopy: Record<StayKind, Tx> = {
  hotel: copy.tours.stayHotel,
  train: copy.tours.stayTrain,
  park: copy.tours.stayPark,
  base: copy.tours.stayBase,
};

function afterLayout(fn: () => void) {
  window.requestAnimationFrame(() => window.requestAnimationFrame(fn));
}

function scrollCenter(sel: string) {
  const el = document.querySelector(sel);
  if (!(el instanceof HTMLElement)) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const strip = el.closest(".overflow-x-auto");
  if (strip) {
    el.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
    return;
  }
  const rect = el.getBoundingClientRect();
  const top = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
  window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
}

function cardSel(id: PlaceId) {
  const desktop = window.matchMedia("(min-width: 1024px)").matches;
  return desktop ? `[data-place-card-desktop="${id}"]` : `[data-place-card-mobile="${id}"]`;
}

export function Timeline({
  routeId,
  onRoute,
  themeId,
  filterOn,
}: {
  routeId: RouteId;
  onRoute: (id: RouteId) => void;
  themeId: ThemeId;
  filterOn: boolean;
}) {
  const { t } = useLocale();
  const route = routes[routeId];
  const [open, setOpen] = useState<number | null>(null);
  const [focus, setFocus] = useState<PlaceId | null>(null);
  const [drawer, setDrawer] = useState<PlaceId | null>(null);
  const [playing, setPlaying] = useState(false);
  const [tweaks, setTweaks] = useState<Partial<Record<PlaceId, PlaceTweak>>>({});

  const seen = new Set<PlaceId>();
  const rows = route.days.map((day, i) => {
    const featured = Boolean(day.placeId && !seen.has(day.placeId));
    if (day.placeId) seen.add(day.placeId);
    return { day, featured, side: (i % 2 === 0 ? "left" : "right") as "left" | "right" };
  });
  const featuredRows = rows.filter((r) => r.featured && r.day.placeId);

  function firstDayOf(id: PlaceId) {
    return route.days.find((d) => d.placeId === id)?.day ?? null;
  }

  function focusFromNode(day: DayStop) {
    setOpen(day.day);
    if (!day.placeId) {
      setFocus(null);
      return;
    }
    setFocus(day.placeId);
    afterLayout(() => scrollCenter(cardSel(day.placeId!)));
  }

  function selectCard(id: PlaceId) {
    setFocus(id);
    setDrawer(id);
    const dayNum = firstDayOf(id);
    if (dayNum != null) setOpen(dayNum);
    afterLayout(() => {
      const day = dayNum ?? route.days.find((d) => d.placeId === id)?.day;
      if (day != null) scrollCenter(`[data-place-node="${day}"]`);
    });
  }

  const drawerPlace = drawer ? places[drawer] : null;
  const drawerDay = drawer ? route.days.find((d) => d.placeId === drawer) : undefined;
  const drawerCity = drawerDay ? t(drawerDay.city) : "";

  return (
    <section id="itinerary" className="pt-10">
      <p className="px-4 text-[13px] font-medium tracking-[0.16em] text-cta">
        {t(copy.tours.days)}
      </p>
      <div className="sticky top-24 z-30 flex bg-paper px-4 py-2 md:top-14">
        <div role="tablist" className="mx-auto flex h-11 w-full max-w-xl overflow-hidden rounded-full bg-bone">
          {(["r1", "r2"] as RouteId[]).map((id) => (
            <button
              key={id}
              role="tab"
              aria-selected={routeId === id}
              type="button"
              onClick={() => {
                onRoute(id);
                setOpen(null);
                setFocus(null);
                setDrawer(null);
              }}
              className={`flex-1 text-[13px] font-medium ${
                routeId === id ? "rounded-full bg-cta text-white" : "text-ink-soft"
              }`}
            >
              {id === "r1" ? t(copy.tours.r1Tab) : t(copy.tours.r2Tab)}
            </button>
          ))}
        </div>
      </div>
      {filterOn ? (
        <p className="px-4 pt-2 text-[12px] text-cta">
          {t(copy.tours.filtered)} {t(copy.tours.themeNames[themeId])}
        </p>
      ) : null}

      <div className="mx-auto mt-4 max-w-6xl px-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:gap-10">
        <div>
          <div className="mb-6 flex gap-3 overflow-x-auto pb-2 snap-x-mandatory lg:hidden">
            {featuredRows.map(({ day }) => {
              const place = day.placeId ? places[day.placeId] : null;
              if (!place || !day.placeId) return null;
              return (
                <div key={day.placeId} className="w-[78vw] shrink-0 snap-start">
                  <DestinationCard
                    place={place}
                    city={t(day.city)}
                    active={focus === day.placeId}
                    mark="mobile"
                    onSelect={() => selectCard(day.placeId!)}
                  />
                </div>
              );
            })}
          </div>

          <ol className="relative">
            <span className="pointer-events-none absolute top-6 bottom-6 left-[35px] w-px bg-cta/25 lg:left-1/2 lg:-translate-x-px" />
            {rows.map(({ day, featured, side }) => (
              <DayBlock
                key={`${routeId}-${day.day}`}
                day={day}
                featured={featured}
                side={side}
                dim={filterOn && !day.themes.includes(themeId)}
                open={open === day.day}
                focused={Boolean(day.placeId && focus === day.placeId)}
                onToggle={() => focusFromNode(day)}
                onSelectCard={() => day.placeId && selectCard(day.placeId)}
              />
            ))}
          </ol>
        </div>
        <div className="mt-12 lg:mt-0">
          <RouteAside routeId={routeId} onPlay={() => setPlaying(true)} />
        </div>
      </div>

      {drawerPlace ? (
        <PlaceDrawer
          key={drawerPlace.id}
          place={drawerPlace}
          city={drawerCity}
          tweak={tweaks[drawerPlace.id] ?? defaultTweak()}
          onTweak={(patch) =>
            setTweaks((cur) => {
              const prev = cur[drawerPlace.id] ?? defaultTweak();
              return { ...cur, [drawerPlace.id]: { ...prev, ...patch } };
            })
          }
          onClose={() => setDrawer(null)}
        />
      ) : null}
      {playing ? <RoutePlayer routeId={routeId} onClose={() => setPlaying(false)} /> : null}
    </section>
  );
}

function DayBlock({
  day,
  featured,
  side,
  dim,
  open,
  focused,
  onToggle,
  onSelectCard,
}: {
  day: DayStop;
  featured: boolean;
  side: "left" | "right";
  dim: boolean;
  open: boolean;
  focused: boolean;
  onToggle: () => void;
  onSelectCard: () => void;
}) {
  const { t } = useLocale();
  const place = day.placeId && featured ? places[day.placeId] : null;
  const card = place ? (
    <DestinationCard
      place={place}
      city={t(day.city)}
      active={focused}
      mark="desktop"
      onSelect={onSelectCard}
    />
  ) : null;

  return (
    <li className={`relative pb-4 transition-opacity ${dim && !focused ? "opacity-35" : ""}`}>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)] lg:items-start lg:gap-4">
        <div className="hidden lg:block">{side === "left" ? card : null}</div>
        <DayRow day={day} open={open} focused={focused} onToggle={onToggle} />
        <div className="hidden lg:block">{side === "right" ? card : null}</div>
      </div>
    </li>
  );
}

function DayRow({
  day,
  open,
  focused,
  onToggle,
}: {
  day: DayStop;
  open: boolean;
  focused: boolean;
  onToggle: () => void;
}) {
  const { t } = useLocale();
  const n = String(day.day).padStart(2, "0");
  return (
    <div>
      <button
        type="button"
        data-place-node={day.day}
        aria-pressed={focused}
        onClick={onToggle}
        className="flex min-h-14 w-full items-center gap-3 py-2 text-left"
      >
        <span
          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-medium ring-2 ${
            focused
              ? "bg-cta text-white ring-cta"
              : "bg-paper text-cta ring-cta/25"
          }`}
        >
          {n}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-[16px] leading-7 ${focused ? "font-medium" : "font-normal"}`}>
            {t(day.city)}
          </span>
          <span className="text-[12px] text-ink-soft">{t(stayCopy[day.stayKind])}</span>
        </span>
        <IconChevron
          className={`h-5 w-5 shrink-0 text-ink-soft transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="ml-[52px] mb-2 rounded-lg bg-surface p-4 lg:ml-0">
          <p className="text-[12px] text-ink-soft">
            {t(day.city)} · {t(day.stay)}
            {day.drive ? ` · ${day.drive} ${t(copy.tours.drive)}` : ""}
          </p>
          <ul className="mt-2 space-y-1.5 text-[15px] leading-7">
            {day.bullets.slice(0, 3).map((b) => (
              <li key={b.en}>{t(b)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
