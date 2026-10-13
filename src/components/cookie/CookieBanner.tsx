import { useEffect, useState } from "react";
import { copy, pathFor } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

const STORAGE_KEY = "cookie_accepted";

function accepted() {
  try {
    return Boolean(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}

export function CookieBanner({ lift = false }: { lift?: boolean }) {
  const { locale, t } = useLocale();
  const [visible, setVisible] = useState(() => !accepted());
  useEffect(() => {
    document.documentElement.classList.toggle("cookie-open", visible);
    return () => document.documentElement.classList.remove("cookie-open");
  }, [visible]);
  if (!visible) return null;

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* 写不进缓存时，这次访问先收起 */
    }
    setVisible(false);
  }

  return (
    <div
      role="region"
      aria-label={t(copy.cookie.accept)}
      className={`fixed inset-x-0 z-[80] border-t border-paper/15 bg-night text-paper shadow-[0_-8px_24px_rgba(16,28,22,0.28)] ${
        lift
          ? "bottom-[calc(2.25rem+env(safe-area-inset-bottom))] md:bottom-0 md:pb-[env(safe-area-inset-bottom)]"
          : "bottom-0 pb-[env(safe-area-inset-bottom)]"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1180px] items-center gap-4 px-4 py-2.5 md:px-8">
        <p className="min-w-0 flex-1 text-[13px] leading-5 text-paper">
          {t(copy.cookie.noteBefore)}
          <a
            href={pathFor(locale, "privacy")}
            className="underline decoration-paper/80 underline-offset-2 hover:decoration-paper"
          >
            {t(copy.cookie.privacy)}
          </a>
          {t(copy.cookie.noteAfter)}
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-md bg-paper px-4 py-2 text-[13px] font-semibold text-night"
        >
          {t(copy.cookie.accept)}
        </button>
      </div>
    </div>
  );
}
