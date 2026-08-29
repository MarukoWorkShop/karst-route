import type { ReactNode, SVGProps } from "react";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

type P = SVGProps<SVGSVGElement>;

export function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();
  const socials: { label: string; href: string; icon: ReactNode }[] = [
    { label: "WhatsApp", href: "#", icon: <IconWhatsApp /> },
    { label: "微信", href: "#", icon: <IconWechat /> },
    { label: "微博", href: "#", icon: <IconWeibo /> },
    { label: "小红书", href: "#", icon: <IconXiaohongshu /> },
    { label: "Instagram", href: "#", icon: <IconInstagram /> },
    { label: "Email", href: "#", icon: <IconEmail /> },
  ];

  return (
    <footer className="bg-ink pb-[calc(80px+env(safe-area-inset-bottom))] md:pb-[60px]">
      <div className="page-col pt-[52px] md:pt-14">
        <div className="grid items-start gap-9 md:mb-10 md:grid-cols-[1fr_auto_1fr] md:gap-12">
          <div className="text-center md:text-left">
            <p className="text-2xl font-medium tracking-[0.06em] text-paper md:text-[26px]">
              {t(copy.footer.brand)}
            </p>
            <p className="mt-1 text-[10px] tracking-[0.22em] text-[rgba(250,248,242,0.4)] uppercase md:text-[10px]">
              {t(copy.footer.brandEn)}
            </p>
            <p className="mx-auto mt-3.5 max-w-[280px] text-[13px] leading-6 text-[rgba(250,248,242,0.5)] md:mx-0">
              {t(copy.footer.tagline)}
            </p>
          </div>
          <div className="hidden w-px self-stretch bg-[rgba(250,248,242,0.08)] md:block" />
          <div className="hidden md:block">
            <p className="mb-4 text-[10px] tracking-[0.12em] text-[rgba(250,248,242,0.3)] uppercase">
              {t(copy.footer.connect)}
            </p>
            <SocialRow socials={socials} />
          </div>
        </div>

        <div className="mt-8 h-px bg-[rgba(250,248,242,0.08)] md:hidden" />
        <div className="mt-8 text-center md:hidden">
          <p className="mb-[18px] text-[10px] tracking-[0.12em] text-[rgba(250,248,242,0.3)] uppercase">
            {t(copy.footer.connect)}
          </p>
          <SocialRow socials={socials} centered />
        </div>

        <div className="mt-7 h-px bg-[rgba(250,248,242,0.08)] md:mt-0 md:mb-6" />
        <div className="flex flex-col items-center justify-between gap-2.5 pb-2 text-center md:flex-row md:text-left">
          <p className="text-[11px] text-[rgba(250,248,242,0.28)]">
            © {year} {t(copy.footer.brand)} · {t(copy.footer.brandEn)} · {t(copy.footer.rights)}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {(
              [
                { href: "#", label: copy.footer.privacy },
                { href: "#", label: copy.footer.terms },
                { href: "#", label: copy.footer.disclaimer },
              ] as const
            ).map((link) => (
              <a
                key={link.label.en}
                href={link.href}
                className="border-b border-[rgba(250,248,242,0.12)] pb-px text-[11px] text-[rgba(250,248,242,0.28)]"
              >
                {t(link.label)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialRow({
  socials,
  centered,
}: {
  socials: { label: string; href: string; icon: ReactNode }[];
  centered?: boolean;
}) {
  return (
    <div>
      <div className={`flex flex-wrap gap-2.5 ${centered ? "justify-center" : ""}`}>
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            aria-label={s.label}
            title={s.label}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(250,248,242,0.1)] bg-[rgba(250,248,242,0.06)] text-[rgba(250,248,242,0.6)] hover:border-[rgba(250,248,242,0.22)] hover:bg-[rgba(250,248,242,0.12)] hover:text-paper"
          >
            {s.icon}
          </a>
        ))}
      </div>
      {centered ? (
        <div className="mt-2 flex flex-wrap justify-center gap-2.5">
          {socials.map((s) => (
            <span
              key={s.label}
              className="w-11 text-center text-[9px] tracking-[0.02em] text-[rgba(250,248,242,0.25)]"
            >
              {s.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function IconWhatsApp(p: P) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden {...p}>
      <path d="M10 2a8 8 0 0 0-6.94 11.97L2 18l4.15-1.08A8 8 0 1 0 10 2zm0 14.4a6.35 6.35 0 0 1-3.24-.89l-.23-.14-2.46.64.66-2.4-.15-.25A6.4 6.4 0 1 1 10 16.4zm3.5-4.77c-.19-.1-1.13-.56-1.31-.62-.17-.06-.3-.1-.42.1-.13.19-.49.62-.6.75-.11.13-.22.14-.41.05a5.2 5.2 0 0 1-1.53-.95 5.74 5.74 0 0 1-1.06-1.32c-.11-.19-.01-.3.08-.39.09-.09.19-.22.29-.33.1-.11.13-.19.19-.32.07-.13.03-.24-.02-.33-.05-.1-.42-1.01-.58-1.38-.15-.36-.3-.31-.42-.32h-.36c-.13 0-.33.05-.5.24-.17.19-.66.65-.66 1.58s.68 1.83.77 1.96c.1.13 1.34 2.04 3.24 2.86.45.2.8.31 1.08.4.45.14.87.12 1.19.07.36-.05 1.12-.46 1.28-.9.16-.44.16-.82.11-.9-.05-.08-.18-.13-.37-.22z" />
    </svg>
  );
}
function IconWechat(p: P) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden {...p}>
      <path d="M7.5 3C4.46 3 2 5.18 2 7.875c0 1.49.77 2.82 1.98 3.72l-.48 1.44 1.67-.84c.56.15 1.16.24 1.78.24.15 0 .3-.01.45-.02a3.8 3.8 0 0 1-.15-1.07c0-2.42 2.24-4.38 5-4.38.17 0 .34.01.5.02C12.33 4.88 10.1 3 7.5 3zm-1.5 2.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5zm3 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5zm2.25 2.25c-2.35 0-4.25 1.68-4.25 3.75 0 2.07 1.9 3.75 4.25 3.75.54 0 1.05-.09 1.52-.24l1.48.75-.43-1.29A3.58 3.58 0 0 0 15.5 11.5c0-2.07-1.9-3.75-4.25-3.75zm-1.25 2a.625.625 0 1 1 0 1.25.625.625 0 0 1 0-1.25zm2.5 0a.625.625 0 1 1 0 1.25.625.625 0 0 1 0-1.25z" />
    </svg>
  );
}
function IconWeibo(p: P) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden {...p}>
      <path d="M8.5 13.5c-2.485 0-4.5-.895-4.5-2s2.015-2 4.5-2 4.5.895 4.5 2-2.015 2-4.5 2zm0-3.2c-1.878 0-3.4.538-3.4 1.2s1.522 1.2 3.4 1.2 3.4-.538 3.4-1.2-1.522-1.2-3.4-1.2zM14.5 5a2.5 2.5 0 0 0-2.5 2.5c0 .18.02.35.05.52A5.5 5.5 0 0 0 8.5 7C5.46 7 3 8.79 3 11s2.46 4 5.5 4 5.5-1.79 5.5-4c0-.88-.38-1.69-1.01-2.36.34-.43.51-.96.51-1.64 0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5c0 .18.03.36.09.52a3.5 3.5 0 0 1 .41-.02c1.26 0 2.37.43 3.14 1.11.12-.34.19-.71.19-1.11A2.5 2.5 0 0 0 14.5 5z" />
    </svg>
  );
}
function IconXiaohongshu(p: P) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden {...p}>
      <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm.75 4.5h1.5v1h-1.5v3.25h-1V7.5H8.25v-1h1.5V5h1v1.5zm-3.5 5.25h5.5v1h-5.5v-1z" />
    </svg>
  );
}
function IconInstagram(p: P) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden {...p}>
      <rect x="3" y="3" width="14" height="14" rx="4" />
      <circle cx="10" cy="10" r="3.5" />
      <circle cx="14" cy="6" r=".75" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconEmail(p: P) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden {...p}>
      <rect x="2" y="4" width="16" height="13" rx="2" />
      <path d="M2 7l8 5 8-5" />
    </svg>
  );
}
