import { useEffect, useState } from "react";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconClose, IconExternal } from "@/components/icons";

type Cur = "CNY" | "USD" | "VND";
// Reference rates pegged to USD (1 USD ≈ 7.25 CNY ≈ 24,800 VND)
const FALLBACK_RATES: Record<Cur, number> = {
  USD: 1,
  CNY: 1 / 0.138,
  VND: 3420 / 0.138,
};
const CUR_META: Record<Cur, { flag: string; symbol: string }> = {
  CNY: { flag: "🇨🇳", symbol: "¥" },
  USD: { flag: "🇺🇸", symbol: "$" },
  VND: { flag: "🇻🇳", symbol: "₫" },
};
const ORDER: Cur[] = ["CNY", "USD", "VND"];

function convert(amount: number, from: Cur, to: Cur, rates: Record<Cur, number>): number {
  if (from === to) return amount;
  return (amount / rates[from]) * rates[to];
}
function fmtAmount(amount: number, cur: Cur): string {
  return cur === "VND" ? Math.round(amount).toLocaleString() : amount.toFixed(2);
}

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



export function ToolsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const [curInput, setCurInput] = useState("100");
  const [baseCur, setBaseCur] = useState<Cur>("CNY");
  const [rates, setRates] = useState<Record<Cur, number>>(FALLBACK_RATES);
  const [rateDate, setRateDate] = useState("");
  const amount = Number(curInput) || 0;

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

  // 拉取最新汇率（fawazahmed0 currency-api，免费无 key，含 CNY/VND）；
// sessionStorage 缓存 24 小时，命中则不重复请求；失败降级到静态值
useEffect(() => {
  if (!open) return;
  const CACHE_KEY = "fxRates";
  const ONE_DAY = 24 * 60 * 60 * 1000;
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "");
    if (
      cached?.ts &&
      Date.now() - cached.ts < ONE_DAY &&
      cached?.rates?.CNY &&
      cached?.rates?.VND
    ) {
      setRates({ USD: 1, CNY: cached.rates.CNY, VND: cached.rates.VND });
      setRateDate(String(cached.date ?? ""));
      return;
    }
  } catch {
    /* sessionStorage 不可用或缓存损坏 — 走 fetch */
  }
  let cancelled = false;
  fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json")
    .then((r) => r.json())
    .then((d) => {
      if (cancelled || !d?.usd?.cny || !d?.usd?.vnd) return;
      const next = { USD: 1, CNY: d.usd.cny, VND: d.usd.vnd };
      setRates(next);
      setRateDate(String(d.date ?? ""));
      try {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ ts: Date.now(), date: d.date, rates: next }),
        );
      } catch {
        /* 写入失败（隐私模式等）— 不影响本次显示 */
      }
    })
    .catch(() => {});
  return () => {
    cancelled = true;
  };
}, [open]);

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
            <p className="mb-2.5 text-[12px] text-ink-soft">
              {baseCur} → {ORDER.filter((c) => c !== baseCur).join(" / ")}
            </p>
            <div className="mb-2.5 flex items-center gap-1 rounded-lg border border-line bg-paper p-0.5">
              {ORDER.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBaseCur(c)}
                  className={`flex-1 rounded-md py-1.5 text-[12px] font-medium transition ${
                    baseCur === c ? "bg-cta text-paper" : "text-ink-soft"
                  }`}
                >
                  {CUR_META[c].flag} {c}
                </button>
              ))}
            </div>
            <div className="mb-2.5 flex items-center gap-2">
              <span className="shrink-0 text-[13px] text-ink-soft">{CUR_META[baseCur].symbol}</span>
              <input
                type="number"
                min={0}
                value={curInput}
                onChange={(e) => setCurInput(e.target.value)}
                className="h-9 flex-1 rounded-lg border border-line bg-paper px-2.5 text-base text-ink outline-none"
              />
              <span className="shrink-0 text-[13px] text-ink-soft">{baseCur}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ORDER.filter((c) => c !== baseCur).map((c) => (
                <div key={c} className="rounded-lg bg-sage px-2.5 py-2">
                  <p className="mb-0.5 text-[11px] text-ink-soft">
                    {CUR_META[c].flag} {c}
                  </p>
                  <p className="text-[14px] font-semibold tracking-[-0.01em] text-ink">
                    {CUR_META[c].symbol} {fmtAmount(convert(amount, baseCur, c, rates), c)}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-ink-soft/70">{t(copy.toolbox.rateNote)}{rateDate ? ` · ${rateDate}` : ""}</p>
          </section>

          <TimeCard />

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

function TimeCard() {
  const { t } = useLocale();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const beijingTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  const beijingHour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Shanghai",
      hour: "2-digit",
      hour12: false,
    }).format(now),
  );
  const localTime = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const online = beijingHour >= 9 && beijingHour < 21;

  return (
    <section className="mb-3 rounded-xl border border-line bg-surface px-4 pt-4 pb-[18px]">
      <h3 className="mb-3 text-[11px] font-semibold tracking-[0.1em] text-cta uppercase">
        {t(copy.toolbox.time)}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-sage px-2.5 py-2">
          <p className="mb-0.5 text-[11px] text-ink-soft">{t(copy.toolbox.timeBeijing)}</p>
          <p className="text-[15px] font-semibold tabular-nums tracking-[-0.01em] text-ink">{beijingTime}</p>
        </div>
        <div className="rounded-lg bg-sage px-2.5 py-2">
          <p className="mb-0.5 text-[11px] text-ink-soft">{t(copy.toolbox.timeLocal)}</p>
          <p className="text-[15px] font-semibold tabular-nums tracking-[-0.01em] text-ink">{localTime}</p>
          {localTz ? <p className="mt-0.5 truncate text-[10px] text-ink-soft/70">{localTz}</p> : null}
        </div>
      </div>
      <p
        className={`mt-2.5 flex items-start gap-1.5 text-[11px] leading-[15px] ${
          online ? "text-ok" : "text-ink-soft"
        }`}
      >
        <span className="shrink-0">{online ? "🟢" : "🌙"}</span>
        <span>{online ? t(copy.toolbox.timeOnline) : t(copy.toolbox.timeNight)}</span>
      </p>
    </section>
  );
}
