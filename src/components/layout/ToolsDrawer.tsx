import { useEffect, useState } from "react";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconClose, IconExternal } from "@/components/icons";

const CNY_TO_VND = 3420;
const CNY_TO_USD = 0.138;

const MAP_PLACES = [
  { label: { en: "Guilin Li River", zh: "桂林漓江" }, q: "Li+River,Guilin,China" },
  { label: { en: "Sapa Rice Terraces", zh: "沙坝梯田" }, q: "Sapa,Vietnam" },
  { label: { en: "Hanoi Old Quarter", zh: "河内老城" }, q: "Hoan+Kiem,Hanoi,Vietnam" },
] as const;

const WEATHER = [
  { region: { en: "Kunming", zh: "昆明" }, icon: "🌤️", temp: "18–24°C", desc: { en: "Spring year-round", zh: "四季如春" } },
  { region: { en: "Nanning", zh: "南宁" }, icon: "⛅", temp: "24–30°C", desc: { en: "Humid, use sunscreen", zh: "湿热，注意防晒" } },
  { region: { en: "Ha Long", zh: "下龙" }, icon: "🌊", temp: "22–28°C", desc: { en: "Sea mist, bring a jacket", zh: "海上多雾，备一件外套" } },
  { region: { en: "Sapa", zh: "沙坝" }, icon: "🌫️", temp: "14–20°C", desc: { en: "Cool & misty", zh: "凉爽多雾" } },
] as const;

const FOOD_TIPS = [
  { emoji: "🥢", tip: { en: "Phở for breakfast — eat it hot", zh: "越南米粉（Phở）— 早餐首选，趁热吃" } },
  { emoji: "☕", tip: { en: "Vietnamese drip coffee with condensed milk", zh: "越南滴滤咖啡配炼乳，强烈推荐" } },
  { emoji: "🌶️", tip: { en: 'Guangxi dishes are sour-spicy — say "不辣" if needed', zh: "广西菜偏酸辣，不喜辣请提前说明" } },
  { emoji: "🍄", tip: { en: "Yunnan wild mushrooms in season Jul–Sep", zh: "云南野生菌季（7–9月）是当地特色" } },
  { emoji: "🚰", tip: { en: "Stick to bottled water throughout", zh: "全程建议饮用瓶装水" } },
  { emoji: "💵", tip: { en: "Vietnam: carry VND cash for street food", zh: "越南多用现金越南盾，备好零钱" } },
] as const;

export function ToolsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const [cnyInput, setCnyInput] = useState("100");
  const amount = Number(cnyInput) || 0;
  const vnd = Math.round(amount * CNY_TO_VND).toLocaleString();
  const usd = (amount * CNY_TO_USD).toFixed(2);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[290] bg-[rgba(20,36,28,0.45)] transition-opacity duration-[260ms] ${
          open ? "pointer-events-auto opacity-100 backdrop-blur-[2px]" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="toolbox-title"
        className={`fixed inset-y-0 left-0 z-[300] flex w-[min(320px,88vw)] flex-col overflow-y-auto bg-paper shadow-[4px_0_32px_rgba(20,36,28,0.18)] transition-transform duration-[280ms] ease-[cubic-bezier(0.32,0,0.16,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        inert={!open}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-4 pt-3.5 pb-3">
          <span id="toolbox-title" className="text-[13px] font-semibold tracking-[0.1em] text-cta">
            {t(copy.toolbox.title)}
          </span>
          <button
            type="button"
            aria-label={t(copy.nav.close)}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 px-3.5 pt-3.5 pb-8">
          <section className="mb-3 rounded-xl border border-line bg-surface px-4 pt-4 pb-[18px]">
            <h3 className="mb-3 text-[11px] font-semibold tracking-[0.1em] text-cta uppercase">
              {t(copy.toolbox.currency)}
            </h3>
            <p className="mb-2.5 text-[12px] text-ink-soft">{t(copy.toolbox.currencySub)}</p>
            <div className="mb-2.5 flex items-center gap-2">
              <span className="shrink-0 text-[13px] text-ink-soft">¥</span>
              <input
                type="number"
                min={0}
                value={cnyInput}
                onChange={(e) => setCnyInput(e.target.value)}
                className="h-9 flex-1 rounded-lg border border-line bg-paper px-2.5 text-base text-ink outline-none"
              />
              <span className="shrink-0 text-[13px] text-ink-soft">CNY</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-sage px-2.5 py-2">
                <p className="mb-0.5 text-[11px] text-ink-soft">🇻🇳 VND</p>
                <p className="text-[14px] font-semibold tracking-[-0.01em] text-ink">{vnd} ₫</p>
              </div>
              <div className="rounded-lg bg-sage px-2.5 py-2">
                <p className="mb-0.5 text-[11px] text-ink-soft">🇺🇸 USD</p>
                <p className="text-[14px] font-semibold tracking-[-0.01em] text-ink">$ {usd}</p>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-ink-soft/70">{t(copy.toolbox.rateNote)}</p>
          </section>

          <section className="mb-3 rounded-xl border border-line bg-surface px-4 pt-4 pb-[18px]">
            <h3 className="mb-3 text-[11px] font-semibold tracking-[0.1em] text-cta uppercase">
              {t(copy.toolbox.map)}
            </h3>
            <p className="mb-3 text-[12px] text-ink-soft">{t(copy.toolbox.mapSub)}</p>
            <a
              href="https://maps.google.com/?q=Guilin,Guangxi,China"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-cta text-[13px] font-medium text-paper"
            >
              <MapPinIcon />
              {t(copy.toolbox.openMaps)}
              <IconExternal className="h-3.5 w-3.5" />
            </a>
            {MAP_PLACES.map((loc) => (
              <a
                key={loc.q}
                href={`https://maps.google.com/?q=${loc.q}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-1.5 flex items-center justify-between rounded-lg bg-sage px-2.5 py-2 text-[12px] text-ink last:mb-0"
              >
                {t(loc.label)}
                <IconExternal className="h-3.5 w-3.5 text-ink-soft" />
              </a>
            ))}
          </section>

          <section className="mb-3 rounded-xl border border-line bg-surface px-4 pt-4 pb-[18px]">
            <h3 className="mb-3 text-[11px] font-semibold tracking-[0.1em] text-cta uppercase">
              {t(copy.toolbox.weather)}
            </h3>
            {WEATHER.map((w) => (
              <div key={w.region.en} className="flex items-center gap-2.5 border-b border-line py-2 last:border-b-0">
                <span className="shrink-0 text-xl" aria-hidden>
                  {w.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-ink">{t(w.region)}</p>
                  <p className="text-[11px] text-ink-soft">{t(w.desc)}</p>
                </div>
                <span className="shrink-0 text-[12px] font-semibold text-cta">{w.temp}</span>
              </div>
            ))}
            <p className="mt-2 text-[10px] text-ink-soft/70">{t(copy.toolbox.weatherNote)}</p>
          </section>

          <section className="rounded-xl border border-line bg-surface px-4 pt-4 pb-[18px]">
            <h3 className="mb-3 text-[11px] font-semibold tracking-[0.1em] text-cta uppercase">
              {t(copy.toolbox.food)}
            </h3>
            {FOOD_TIPS.map((item, i) => (
              <div
                key={item.tip.en}
                className={`flex items-start gap-2.5 py-2 ${i < FOOD_TIPS.length - 1 ? "border-b border-line" : ""}`}
              >
                <span className="mt-px shrink-0 text-base" aria-hidden>
                  {item.emoji}
                </span>
                <span className="text-[12px] leading-[18px] text-ink">{t(item.tip)}</span>
              </div>
            ))}
          </section>
        </div>
      </aside>
    </>
  );
}

function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
