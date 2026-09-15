import { useCallback, useEffect, useState } from "react";
import {
  FALLBACK_RATES,
  loadRates,
  readPriceCurrency,
  writePriceCurrency,
  type DisplayCurrency,
  type FxRates,
} from "@/lib/fx";

/** Load shared FX rates once on mount (toolbox + English prices). */
export function useFxRates() {
  const [rates, setRates] = useState<FxRates>(FALLBACK_RATES);
  const [rateDate, setRateDate] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadRates().then((r) => {
      if (cancelled) return;
      setRates(r.rates);
      setRateDate(r.date);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { rates, rateDate, ready };
}

/** English display currency preference (USD default). Ignored on zh. */
export function usePriceCurrency() {
  const [currency, setCurrencyState] = useState<DisplayCurrency>("USD");

  useEffect(() => {
    setCurrencyState(readPriceCurrency());
  }, []);

  const setCurrency = useCallback((next: DisplayCurrency) => {
    setCurrencyState(next);
    writePriceCurrency(next);
  }, []);

  return { currency, setCurrency };
}
