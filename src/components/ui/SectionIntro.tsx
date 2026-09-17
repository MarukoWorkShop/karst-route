import type { ReactNode } from "react";

/**
 * 首页模块头：主标题 → Best for（茶棕）→ 说明段。
 * 字阶：h2 / sub / body（一类一字号）。
 */
export function SectionIntro({
  title,
  sub,
  desc,
  action,
  className = "",
}: {
  title: string;
  sub: string;
  desc: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-[640px] ${className}`}>
      <h2 className="type-h2 text-cta">{title}</h2>
      <p className="type-sub mt-2 max-w-[52ch] text-tea">{sub}</p>
      <p className="type-body mt-3 max-w-[62ch] text-ink-soft">{desc}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
