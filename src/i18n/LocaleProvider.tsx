import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  copy,
  localeFromPath,
  pathFor,
  t,
  type Locale,
  type Tx,
} from "@/i18n/copy";

type Ctx = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (tx: Tx) => string;
};

const LocaleContext = createContext<Ctx | null>(null);

function applyHead(locale: Locale) {
  const html = document.documentElement;
  html.lang = locale === "zh" ? "zh-Hans" : "en";
  document.title = t(copy.meta.title, locale);

  const origin = window.location.origin;
  const pairs: [string, string][] = [
    ["canonical", origin + pathFor(locale)],
    ["en", origin + pathFor("en")],
    ["zh-Hans", origin + pathFor("zh")],
    ["x-default", origin + pathFor("en")],
  ];

  const ensure = (rel: string, hreflang: string | null, href: string) => {
    const sel = hreflang
      ? `link[rel="${rel}"][hreflang="${hreflang}"]`
      : `link[rel="${rel}"]:not([hreflang])`;
    let el = document.head.querySelector(sel) as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement("link");
      el.rel = rel;
      if (hreflang) el.hreflang = hreflang;
      document.head.appendChild(el);
    }
    el.href = href;
  };

  ensure("canonical", null, pairs[0][1]);
  ensure("alternate", "en", pairs[1][1]);
  ensure("alternate", "zh-Hans", pairs[2][1]);
  ensure("alternate", "x-default", pairs[3][1]);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    typeof window === "undefined" ? "en" : localeFromPath(window.location.pathname),
  );

  const setLocale = useCallback((next: Locale) => {
    const hash = window.location.hash;
    const url = pathFor(next) + hash;
    window.history.pushState({ locale: next }, "", url);
    setLocaleState(next);
  }, []);

  useEffect(() => {
    applyHead(locale);
  }, [locale]);

  useEffect(() => {
    const onPop = () => setLocaleState(localeFromPath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale,
      t: (tx) => t(tx, locale),
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale needs LocaleProvider");
  return ctx;
}
