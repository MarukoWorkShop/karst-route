import { useEffect, useMemo, useState } from "react";
import { IconClose, IconMore, IconShare, IconSmartphone } from "@/components/icons";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

const DISMISSED_AT_KEY = "leisuretime-pwa-prompt-dismissed-at";
const INSTALLED_KEY = "leisuretime-pwa-installed";
const DISMISS_FOR_MS = 14 * 24 * 60 * 60 * 1000;

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Platform = "ios" | "android" | "in-app" | "other";

function isStandalone() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/MicroMessenger|Weibo|QQ\//i.test(ua)) return "in-app";
  if (
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  ) {
    return "ios";
  }
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export function PwaInstallPrompt({ blocked = false }: { blocked?: boolean }) {
  const { t } = useLocale();
  const [eligible, setEligible] = useState(false);
  const [timeReady, setTimeReady] = useState(false);
  const [hasExplored, setHasExplored] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const platform = useMemo(() => (typeof navigator === "undefined" ? "other" : detectPlatform()), []);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px) and (pointer: coarse)").matches;
    const dismissedAt = Number(window.localStorage.getItem(DISMISSED_AT_KEY) || 0);
    const recentlyDismissed = Date.now() - dismissedAt < DISMISS_FOR_MS;

    if (
      !mobile ||
      isStandalone() ||
      window.localStorage.getItem(INSTALLED_KEY) === "true" ||
      recentlyDismissed
    ) {
      return;
    }

    setEligible(true);
    const timer = window.setTimeout(() => setTimeReady(true), 9000);
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.55) setHasExplored(true);
    };
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      window.localStorage.setItem(INSTALLED_KEY, "true");
      setEligible(false);
      setGuideOpen(false);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!guideOpen) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGuideOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [guideOpen]);

  function dismiss() {
    window.localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
    setGuideOpen(false);
    setEligible(false);
  }

  async function install() {
    if (platform === "android" && installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      if (choice.outcome === "accepted") {
        window.localStorage.setItem(INSTALLED_KEY, "true");
      } else {
        window.localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
      }
      setEligible(false);
      return;
    }
    setGuideOpen(true);
  }

  const visible = eligible && timeReady && hasExplored && !blocked && !guideOpen;
  const guide =
    platform === "in-app"
      ? copy.pwa.inApp
      : platform === "ios"
        ? copy.pwa.ios
        : copy.pwa.browser;

  return (
    <>
      <aside
        aria-label={t(copy.pwa.title)}
        aria-hidden={!visible}
        inert={!visible ? true : undefined}
        className={`fixed right-3 bottom-[calc(env(safe-area-inset-bottom)+3rem)] left-3 z-50 mx-auto max-w-sm rounded-xl border border-paper/15 bg-night/96 p-3.5 text-paper shadow-[0_18px_48px_rgba(16,28,22,0.3)] backdrop-blur-md transition-[transform,opacity] duration-300 md:hidden ${
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-start gap-3">
          <a
            href={`${import.meta.env.BASE_URL}icons/icon-192.png`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t(copy.pwa.openIcon)}
            className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-bright"
          >
            <img
              src={`${import.meta.env.BASE_URL}icons/icon-192.png`}
              alt=""
              className="h-11 w-11 rounded-lg ring-1 ring-paper/15"
            />
          </a>
          <div className="min-w-0 flex-1">
            <p className="type-sub font-semibold text-paper">{t(copy.pwa.title)}</p>
            <p className="type-aux mt-1 text-paper/70">{t(copy.pwa.body)}</p>
          </div>
          <button
            type="button"
            aria-label={t(copy.nav.close)}
            onClick={dismiss}
            className="-mt-1 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-paper/60"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 pl-14">
          <button
            type="button"
            onClick={dismiss}
            className="type-btn min-h-10 flex-1 rounded-lg border border-paper/20 px-3 text-paper/70"
          >
            {t(copy.pwa.later)}
          </button>
          <button
            type="button"
            onClick={install}
            className="type-btn min-h-10 flex-[1.35] rounded-lg bg-paper px-3 font-semibold text-cta"
          >
            {t(copy.pwa.add)}
          </button>
        </div>
      </aside>

      {guideOpen ? (
        <div className="fixed inset-0 z-[320] flex items-end md:hidden">
          <button
            type="button"
            aria-label={t(copy.nav.close)}
            onClick={() => setGuideOpen(false)}
            className="absolute inset-0 bg-night/55 backdrop-blur-[2px]"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-guide-title"
            className="relative z-[1] w-full rounded-t-xl bg-paper px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-18px_48px_rgba(16,28,22,0.2)]"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" aria-hidden />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="type-meta text-gold">{t(copy.pwa.kicker)}</p>
                <h2 id="pwa-guide-title" className="type-h3 mt-1 text-ink">
                  {t(guide.title)}
                </h2>
              </div>
              <button
                type="button"
                aria-label={t(copy.nav.close)}
                onClick={() => setGuideOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage text-ink-soft"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>

            <ol className="mt-5 space-y-3">
              {guide.steps.map((step, index) => (
                <li key={step.en} className="flex items-center gap-3 rounded-xl bg-surface p-3 ring-1 ring-line">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cta text-paper">
                    {index === 0 ? (
                      platform === "in-app" ? (
                        <IconMore className="h-4 w-4" />
                      ) : (
                        <IconShare className="h-4 w-4" />
                      )
                    ) : (
                      <IconSmartphone className="h-4 w-4" />
                    )}
                  </span>
                  <span className="type-body text-ink">{t(step)}</span>
                </li>
              ))}
            </ol>

            <button
              type="button"
              onClick={dismiss}
              className="type-btn mt-5 min-h-11 w-full rounded-lg bg-cta px-4 text-paper"
            >
              {t(copy.pwa.gotIt)}
            </button>
          </aside>
        </div>
      ) : null}
    </>
  );
}
