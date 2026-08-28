import { useEffect, useState } from "react";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconSparkles } from "@/components/icons";

const LINES = [copy.craft.magic1, copy.craft.magic2, copy.craft.magic3];

export function PlanMagic() {
  const { t } = useLocale();
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % LINES.length), 1400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="py-6" aria-live="polite" aria-busy="true">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cta/30 bg-cta/8 text-cta ai-glow">
        <IconSparkles className="h-6 w-6" />
      </div>
      <p className="mt-6 text-center text-[16px] leading-7">{t(LINES[i] ?? copy.craft.magic1)}</p>
      <div className="mt-8 space-y-3" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="flex h-14 items-center gap-3 rounded-lg border border-line bg-surface px-3">
            <div className="sk-pulse h-8 w-8 rounded-lg bg-bone" />
            <div className="flex-1 space-y-2">
              <div className="sk-pulse h-3 w-1/3 rounded bg-bone" />
              <div className="sk-pulse h-3 w-2/3 rounded bg-bone-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
