import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { mapCities, mapPaths, mapRegions, mapViewBox } from "@/data/regionMap";

function labelAttr(anchor: (typeof mapCities)[number]["anchor"]) {
  switch (anchor) {
    case "left":
      return { textAnchor: "end" as const, dx: -8, dy: 4 };
    case "right":
      return { textAnchor: "start" as const, dx: 8, dy: 4 };
    case "top":
      return { textAnchor: "middle" as const, dx: 0, dy: -10 };
    case "bottom":
      return { textAnchor: "middle" as const, dx: 0, dy: 16 };
  }
}

export function RegionMap() {
  const { t, locale } = useLocale();

  return (
    <figure className="mx-auto w-full">
      <svg
        viewBox={mapViewBox}
        role="img"
        aria-label={t(copy.hero.mapAria)}
        className="block h-auto w-full overflow-hidden"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <g className="region-map-land" strokeWidth="0.9" strokeLinejoin="round">
          <path d={mapPaths.myanmar} />
          <path d={mapPaths.thailand} />
          <path d={mapPaths.laos} />
          <path d={mapPaths.guizhou} />
          <path d={mapPaths.guangdong} />
          <path d={mapPaths.hainan} />
          <path d={mapPaths.vietnam} />
        </g>
        <g className="region-map-core" strokeWidth="1.35" strokeLinejoin="round">
          <path d={mapPaths.yunnan} />
          <path d={mapPaths.guangxi} />
          <path d={mapPaths.vietnamNorth} />
        </g>
        {mapRegions.map((r) => (
          <text
            key={r.id}
            x={r.x}
            y={r.y}
            textAnchor="middle"
            fill="var(--color-cta)"
            fillOpacity="0.72"
            fontSize={locale === "zh" ? 15 : 13}
            fontWeight="500"
            letterSpacing={locale === "en" ? "0.22em" : "0.12em"}
          >
            {t(r.label)}
          </text>
        ))}
        {mapCities.map((c) => {
          const a = labelAttr(c.anchor);
          return (
            <g key={c.id} className={c.rank === 2 ? "region-map-city-2" : undefined}>
              <CityMark city={c} attr={a} label={t(c.label)} />
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-3 text-center text-[12px] tracking-[0.14em] text-ink-soft">
        {t(copy.hero.mapCaption)}
      </figcaption>
    </figure>
  );
}

function CityMark({
  city,
  attr,
  label,
}: {
  city: (typeof mapCities)[number];
  attr: ReturnType<typeof labelAttr>;
  label: string;
}) {
  return (
    <>
      <circle
        cx={city.x}
        cy={city.y}
        r={city.rank === 1 ? 4 : 3}
        fill="var(--color-cta)"
        stroke="var(--color-paper)"
        strokeWidth="1.5"
      />
      <text
        x={city.x}
        y={city.y}
        dx={attr.dx}
        dy={attr.dy}
        textAnchor={attr.textAnchor}
        fill="var(--color-ink)"
        fontSize="12"
        fontWeight="500"
      >
        {label}
      </text>
    </>
  );
}
