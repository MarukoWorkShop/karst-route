import { useRef, useState, type ReactNode } from "react";
import type { DayStop, RouteId } from "@/types";
import { routes } from "@/data/itinerary";
import { places, placeStories } from "@/data/destinations";
import { IconBoat, IconChevron, IconDining, IconLodge, IconVan } from "@/components/icons";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { ReviewsFold } from "@/components/itinerary/ReviewsFold";
import { RoutePlayer } from "@/components/itinerary/RoutePlayer";

export function Timeline({
  routeId,
  onRoute,
}: {
  routeId: RouteId;
  onRoute: (id: RouteId) => void;
}) {
  const { t } = useLocale();
  const route = routes[routeId];
  const stopCount = new Set(route.days.map((d) => d.placeId).filter(Boolean)).size;
  // 移动端：手风琴展开
  const [open, setOpen] = useState<number | null>(null);
  // 桌面端：右栏当前选中那天
  const [selectedDay, setSelectedDay] = useState<number>(route.days[0].day);
  const [playing, setPlaying] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  // 同一目的地连住多晚时，只在抵达当天展开完整讲解，后续日期不再重复
  const firstVisitDays = (() => {
    const seen = new Set<string>();
    const days = new Set<number>();
    for (const d of route.days) {
      if (!d.placeId || seen.has(d.placeId)) continue;
      seen.add(d.placeId);
      days.add(d.day);
    }
    return days;
  })();

  const selectedStop = route.days.find((d) => d.day === selectedDay) ?? route.days[0];

  function selectDay(day: number) {
    setSelectedDay(day);
    // 右栏内容更新后滚到顶
    requestAnimationFrame(() => detailRef.current?.scrollTo({ top: 0 }));
  }

  return (
    <section id="itinerary" className="scroll-mt-24 py-12">
      <div className="page-col">
        <p className="text-[13px] font-medium tracking-[0.12em] text-cta uppercase">
          {t(copy.tours.days)}
        </p>
      </div>
      <div className="sticky top-[52px] z-30 border-b border-line bg-paper md:top-[60px]">
        <div role="tablist" className="page-col flex">
          {(["r1", "r2"] as RouteId[]).map((id) => (
            <button
              key={id}
              role="tab"
              aria-selected={routeId === id}
              type="button"
              onClick={() => {
                onRoute(id);
                setOpen(null);
                setSelectedDay(routes[id].days[0].day);
              }}
              className={`h-11 flex-1 text-[14px] font-medium ${
                routeId === id
                  ? "border-b-2 border-cta text-cta"
                  : "border-b-2 border-transparent text-ink-soft"
              }`}
            >
              {id === "r1" ? t(copy.tours.r1Tab) : t(copy.tours.r2Tab)}
            </button>
          ))}
        </div>
      </div>
      <div className={playing ? "bg-cta" : "border-b border-line bg-bone"}>
        <div className="page-col">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="flex w-full items-center gap-3 py-[11px]"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                playing
                  ? "border-[1.5px] border-paper/35 bg-paper/18 text-paper"
                  : "bg-cta text-paper"
              }`}
            >
              {playing ? <CloseMark /> : <PlayMark />}
            </span>
            <span
              className={`flex-1 text-left text-[13px] font-medium ${
                playing ? "text-paper" : "text-cta"
              }`}
            >
              {t(copy.tours.book.viewMap)}
            </span>
            {playing ? null : (
              <span className="text-[11px] text-ink-soft">
                {stopCount} {t(copy.tours.book.mapStops)}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="page-col mt-2">
        {/* 移动端：手风琴，点开在下方展开 */}
        <ol className="mx-auto max-w-[640px] md:hidden">
          {route.days.map((day) => (
            <DayRow
              key={`${routeId}-${day.day}`}
              day={day}
              open={open === day.day}
              showDetail={firstVisitDays.has(day.day)}
              onToggle={() => setOpen((cur) => (cur === day.day ? null : day.day))}
            />
          ))}
        </ol>
        <div className="md:hidden">
          <ReviewsFold />
        </div>

        {/* 桌面端：左列表 + 右详情的两栏 master-detail */}
        <div className="hidden md:grid md:grid-cols-[0.82fr_1.3fr] md:gap-x-10">
          <ol className="scroll-thin md:sticky md:top-[110px] md:max-h-[calc(100svh-130px)] md:overflow-y-auto md:py-1 md:pr-1">
            {route.days.map((day) => (
              <DayListItem
                key={`${routeId}-${day.day}`}
                day={day}
                selected={selectedDay === day.day}
                onSelect={() => selectDay(day.day)}
              />
            ))}
          </ol>
          <div
            ref={detailRef}
            className="scroll-thin md:sticky md:top-[110px] md:max-h-[calc(100svh-130px)] md:overflow-y-auto md:py-1 md:pl-1"
          >
            <div key={selectedDay}>
              <DayDetailContent day={selectedStop} showDetail={firstVisitDays.has(selectedStop.day)} />
            </div>
          </div>
          {/* 评价链接：放在整条线路模块底部，每条线路只显示一次 */}
          <div className="md:col-start-2 md:px-1 md:pt-1 md:pb-2">
            <ReviewsFold />
          </div>
        </div>
      </div>

      {playing ? <RoutePlayer routeId={routeId} onClose={() => setPlaying(false)} /> : null}
    </section>
  );
}

/** 移动端手风琴行：折叠态按钮 + 展开后调用 DayDetailContent */
function DayRow({
  day,
  open,
  showDetail,
  onToggle,
}: {
  day: DayStop;
  open: boolean;
  /** 抵达当天才展开完整讲解；连住的第二晚起不再重复 */
  showDetail?: boolean;
  onToggle: () => void;
}) {
  const { t } = useLocale();
  const n = String(day.day).padStart(2, "0");
  const place = day.placeId ? places[day.placeId] : null;
  const city = t(day.city);
  const stay = t(day.stay);
  const subtitle = stay === city && place ? t(place.tagline) : stay;

  return (
    <li className="border-b border-line">
      <button
        type="button"
        data-place-node={day.day}
        aria-expanded={open}
        onClick={onToggle}
        className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cta text-[13px] font-medium text-cta">
          {n}
        </span>
        <span className="min-w-0 flex-1 text-[17px] font-medium text-ink">{city}</span>
        <span className="max-w-[46%] shrink-0 truncate text-right text-[13px] text-ink-soft">
          {subtitle}
        </span>
        <IconChevron
          className={`h-4 w-4 shrink-0 text-ink-soft transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="px-4">
          <DayDetailContent day={day} showDetail={showDetail} />
        </div>
      ) : null}
    </li>
  );
}

/** 桌面端左栏轻量行：编号 + 城市 + 副标题，选中态高亮 */
function DayListItem({
  day,
  selected,
  onSelect,
}: {
  day: DayStop;
  selected: boolean;
  onSelect: () => void;
}) {
  const { t } = useLocale();
  const n = String(day.day).padStart(2, "0");
  const place = day.placeId ? places[day.placeId] : null;
  const city = t(day.city);
  const stay = t(day.stay);
  const subtitle = stay === city && place ? t(place.tagline) : stay;
  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
          selected ? "bg-sage" : "hover:bg-surface"
        }`}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[13px] font-medium ${
            selected ? "border-cta bg-cta text-paper" : "border-cta text-cta"
          }`}
        >
          {n}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`block truncate text-[15px] ${
              selected ? "font-semibold text-cta" : "font-medium text-ink"
            }`}
          >
            {city}
          </span>
          <span className="mt-0.5 block truncate text-[12px] text-ink-soft">{subtitle}</span>
        </span>
        <IconChevron
          className={`h-4 w-4 shrink-0 text-ink-soft transition ${selected ? "rotate-180" : ""}`}
        />
      </button>
    </li>
  );
}

/** 一天的详情内容：图 + 讲解词 + 深度讲解 + 看点 + 交通/住宿/餐饮表。
 *  移动端展开态与桌面右栏共用。 */
function DayDetailContent({ day, showDetail }: { day: DayStop; showDetail?: boolean }) {
  const { t } = useLocale();
  const n = String(day.day).padStart(2, "0");
  const place = day.placeId ? places[day.placeId] : null;
  const story = day.placeId ? placeStories[day.placeId] : null;
  const city = t(day.city);
  const stay = t(day.stay);
  const subtitle = stay === city && place ? t(place.tagline) : stay;
  const photos = (day.photos ?? story?.slides ?? (place ? [place.photo] : [])).slice(0, 3);
  const blurb = day.blurb ?? story?.culture;
  const transport = day.transport ?? day.drive;
  const lodging = day.lodging ?? place?.hotel.title;
  const dining = day.dining ?? (place ? [place.cuisine.title] : undefined);

  // 深度讲解词：体验 / 餐饮 / 住宿 —— 连住多晚时只在抵达当天出现
  const detail =
    showDetail && place
      ? [
          {
            label: copy.tours.book.experience,
            title: place.experience.title,
            body: place.experience.body,
          },
          { label: copy.tours.book.dining, title: place.cuisine.title, body: place.cuisine.body },
          { label: copy.tours.book.stay, title: place.hotel.title, body: place.hotel.body },
        ]
      : [];

  return (
    <div className="pb-5">
      {/* 顶部：编号 chip + 城市 + 副标题 */}
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cta text-[13px] font-medium text-cta">
          {n}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[20px] font-medium text-ink">{city}</p>
        </div>
        <span className="max-w-[48%] shrink-0 truncate text-right text-[13px] text-ink-soft">
          {subtitle}
        </span>
      </div>

      {photos.length > 0 ? (
        <div
          className={`grid gap-1.5 ${
            photos.length === 1
              ? "grid-cols-1"
              : photos.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
          }`}
        >
          {photos.map((src) => (
            <img loading="lazy"
              key={src}
              src={src}
              alt=""
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
          ))}
        </div>
      ) : null}

      {blurb ? (
        <p className="mt-4 border-l-2 border-gold pl-3 text-[14px] leading-6 text-ink">
          {t(blurb)}
        </p>
      ) : null}

      {detail.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3.5">
          {detail.map((d) => (
            <div key={d.label.en}>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-cta">
                {t(d.label)}
              </p>
              <p className="mt-1 text-[14px] font-medium text-ink">{t(d.title)}</p>
              <p className="mt-1.5 text-[13.5px] leading-[22px] text-ink-soft">{t(d.body)}</p>
            </div>
          ))}
        </div>
      ) : null}

      {day.bullets.length > 0 ? (
        <ul className="mt-3.5 flex flex-col gap-2">
          {day.bullets.map((b) => (
            <li key={b.en} className="flex gap-2.5 text-[14px] leading-[22px] text-ink">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              {t(b)}
            </li>
          ))}
        </ul>
      ) : null}

      {transport || lodging || dining ? (
        <div className="mt-4 divide-y divide-paper overflow-hidden rounded-2xl bg-sage">
          {transport ? (
            <LogRow
              icons={
                <>
                  <IconVan className="h-4 w-4" />
                  <IconBoat className="h-4 w-4" />
                </>
              }
              label={t(copy.tours.book.transport)}
              lines={[t(transport)]}
            />
          ) : null}
          {lodging ? (
            <LogRow
              icons={<IconLodge className="h-4 w-4" />}
              label={t(copy.tours.book.stay)}
              lines={[t(lodging)]}
            />
          ) : null}
          {dining && dining.length > 0 ? (
            <LogRow
              icons={<IconDining className="h-4 w-4" />}
              label={t(copy.tours.book.dining)}
              lines={dining.map((line) => t(line))}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function LogRow({
  icons,
  label,
  lines,
}: {
  icons: ReactNode;
  label: string;
  lines: string[];
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center gap-0.5 text-ink" aria-hidden>
        {icons}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium text-ink">{label}</span>
        {lines.map((line) => (
          <span key={line} className="mt-0.5 block text-[13px] leading-5 text-ink-soft">
            {line}
          </span>
        ))}
      </span>
    </div>
  );
}

function PlayMark() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor" aria-hidden className="ml-0.5">
      <path d="M2.5 1.5 9.5 5.5 2.5 9.5z" />
    </svg>
  );
}

function CloseMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M2 2l8 8M10 2l-8 8" />
    </svg>
  );
}
