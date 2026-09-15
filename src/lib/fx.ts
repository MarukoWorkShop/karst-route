/**
 * Shared FX for toolbox + English price display.
 * Source: fawazahmed0 currency-api (USD base), 24h sessionStorage cache, static fallback.
 *
 * Rates are “units per 1 USD”: rates.CNY ≈ 7.25 means 1 USD ≈ 7.25 CNY.
 * USD = CNY / rates.CNY
 * EUR = (CNY / rates.CNY) * rates.EUR
 */
export type FxCur = "USD" | "CNY" | "EUR" | "VND";
export type DisplayCurrency = "USD" | "EUR";

export type FxRates = Record<FxCur, number>;

export const FX_CACHE_KEY = "fxRates";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** ~1 USD ≈ 7.25 CNY ≈ 0.92 EUR ≈ 24,800 VND */
export const FALLBACK_RATES: FxRates = {
  USD: 1,
  CNY: 1 / 0.138,
  EUR: 0.92,
  VND: 3420 / 0.138,
};

const PRICE_CURRENCY_KEY = "priceCurrency";

export function readPriceCurrency(): DisplayCurrency {
  try {
    const v = localStorage.getItem(PRICE_CURRENCY_KEY);
    if (v === "EUR" || v === "USD") return v;
  } catch {
    /* private mode */
  }
  return "USD";
}

export function writePriceCurrency(cur: DisplayCurrency): void {
  try {
    localStorage.setItem(PRICE_CURRENCY_KEY, cur);
  } catch {
    /* ignore */
  }
}

type CachePayload = {
  ts: number;
  date?: string;
  rates: Partial<FxRates>;
};

function readCache(): { rates: FxRates; date: string } | null {
  try {
    const raw = sessionStorage.getItem(FX_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachePayload;
    if (!cached?.ts || Date.now() - cached.ts >= ONE_DAY_MS) return null;
    if (!cached.rates?.CNY || !cached.rates?.VND) return null;
    return {
      rates: {
        USD: 1,
        CNY: Number(cached.rates.CNY),
        EUR: Number(cached.rates.EUR) || FALLBACK_RATES.EUR,
        VND: Number(cached.rates.VND),
      },
      date: String(cached.date ?? ""),
    };
  } catch {
    return null;
  }
}

function writeCache(rates: FxRates, date: string): void {
  try {
    sessionStorage.setItem(
      FX_CACHE_KEY,
      JSON.stringify({ ts: Date.now(), date, rates }),
    );
  } catch {
    /* ignore */
  }
}

export type LoadRatesResult = { rates: FxRates; date: string };

/**
 * Resolve rates: cache → network → fallback.
 * Always returns usable numbers (never throws).
 */
export async function loadRates(): Promise<LoadRatesResult> {
  const hit = readCache();
  if (hit) return hit;

  const urls = [
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json",
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
    "https://latest.currency-api.pages.dev/v1/currencies/usd.min.json",
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const d = (await res.json()) as { date?: string; usd?: Record<string, number> };
      const cny = d?.usd?.cny;
      const vnd = d?.usd?.vnd;
      const eur = d?.usd?.eur;
      if (!cny || !vnd) continue;
      const rates: FxRates = {
        USD: 1,
        CNY: cny,
        EUR: eur || FALLBACK_RATES.EUR,
        VND: vnd,
      };
      const date = String(d.date ?? "");
      writeCache(rates, date);
      return { rates, date };
    } catch {
      /* try next */
    }
  }

  return { rates: { ...FALLBACK_RATES }, date: "" };
}

/** Convert between toolbox currencies (USD-pegged rates). */
export function convertFx(amount: number, from: FxCur, to: FxCur, rates: FxRates): number {
  if (from === to) return amount;
  return (amount / rates[from]) * rates[to];
}

/** CNY amount → USD or EUR for English display. */
export function cnyTo(amountCny: number, to: DisplayCurrency, rates: FxRates): number {
  const usd = amountCny / rates.CNY;
  if (to === "USD") return usd;
  return usd * rates.EUR;
}

export function fmtCny(v: number): string {
  return `¥${Math.round(v).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatMoney(
  amountCny: number,
  opts: { locale: "en" | "zh"; currency?: DisplayCurrency; rates?: FxRates },
): string {
  if (opts.locale !== "en") return fmtCny(amountCny);
  const currency = opts.currency ?? "USD";
  const rates = opts.rates ?? FALLBACK_RATES;
  const n = Math.round(cnyTo(amountCny, currency, rates));
  const formatted = n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return currency === "EUR" ? `€${formatted}` : `$${formatted}`;
}
