import { useMemo, useState } from "react";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

const seasonIds = ["cool", "shoulder", "wet"] as const;
const legIds = [
  "hanoi-sapa",
  "hekou-jianshui",
  "mile-kunming",
  "nanning-detian",
  "catba-haiphong",
] as const;

export function TravelTools() {
  const { t } = useLocale();
  const [season, setSeason] = useState<(typeof seasonIds)[number]>("cool");
  const [leg, setLeg] = useState<(typeof legIds)[number]>("hanoi-sapa");
  const [dest, setDest] = useState<"vn" | "cn">("vn");
  const seasonNote = t(copy.tools[`${season}N`]);
  const hours = useMemo(() => t(copy.tools.hours[leg]), [leg, t]);

  return (
    <section id="tools" className="scroll-mt-24 px-4 pt-8 pb-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-[12px] font-medium tracking-[0.16em] text-ink-soft">
          {t(copy.tools.kicker)}
        </p>
        <h2 className="mt-2 text-[18px] font-medium text-ink-soft">{t(copy.tools.h2)}</h2>
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div id="tool-visa" className="scroll-mt-28 rounded-lg border border-line bg-paper p-4">
            <h3 className="text-[16px] font-medium">{t(copy.tools.visaH)}</h3>
            <div className="mt-3 flex gap-2">
              <Chip on={dest === "vn"} onClick={() => setDest("vn")}>
                {t(copy.tools.vn)}
              </Chip>
              <Chip on={dest === "cn"} onClick={() => setDest("cn")}>
                {t(copy.tools.cn)}
              </Chip>
            </div>
            <p className="mt-3 text-[14px] leading-6 text-ink-soft">
              {dest === "vn" ? t(copy.tools.visaVn) : t(copy.tools.visaCn)}
            </p>
            <p className="mt-2 text-[12px] text-ink-soft">{t(copy.tools.visaDis)}</p>
          </div>
          <div id="tool-season" className="scroll-mt-28 rounded-lg border border-line bg-paper p-4">
            <h3 className="text-[16px] font-medium">{t(copy.tools.seasonH)}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {seasonIds.map((id) => (
                <Chip key={id} on={season === id} onClick={() => setSeason(id)}>
                  {t(copy.tools[id])}
                </Chip>
              ))}
            </div>
            <p className="mt-3 text-[14px] leading-6 text-ink-soft">{seasonNote}</p>
          </div>
          <div id="tool-transit" className="scroll-mt-28 rounded-lg border border-line bg-paper p-4">
            <h3 className="text-[16px] font-medium">{t(copy.tools.transitH)}</h3>
            <label className="mt-3 block text-[13px] text-ink-soft">
              {t(copy.tools.leg)}
              <select
                value={leg}
                onChange={(e) => setLeg(e.target.value as (typeof legIds)[number])}
                className="mt-1 h-11 w-full rounded-lg border border-line bg-surface px-3 text-ink"
              >
                {legIds.map((id) => (
                  <option key={id} value={id}>
                    {t(copy.tools.legs[id])}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-3 text-[14px] leading-6 text-ink-soft">{hours}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-full px-3 text-[13px] ${
        on ? "bg-cta text-white" : "border border-line bg-surface"
      }`}
    >
      {children}
    </button>
  );
}
