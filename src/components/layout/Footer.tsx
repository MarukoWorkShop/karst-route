import { useCallback, useState, type ReactNode, type SVGProps } from "react";
import { about } from "@/content/about";
import { conciergeContact } from "@/data/concierge";
import { copy, pathFor } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { QrDialog, QrIconButton, type QrContactKind } from "@/components/layout/WechatContact";

type P = SVGProps<SVGSVGElement>;

export function Footer() {
  const { locale, t } = useLocale();
  const [qrOpen, setQrOpen] = useState<QrContactKind | null>(null);
  const openQr = useCallback((kind: QrContactKind) => setQrOpen(kind), []);
  const closeQr = useCallback(() => setQrOpen(null), []);
  const year = new Date().getFullYear();
  const whatsappDigits = conciergeContact.whatsapp.replace(/\D/g, "");
  const socials: { label: string; href: string; icon: ReactNode; qr?: QrContactKind }[] = [
    {
      label: "WhatsApp",
      href: whatsappDigits ? `https://wa.me/${whatsappDigits}` : "#",
      icon: <IconWhatsApp />,
    },
    { label: "微信", href: "#", icon: <IconWechat />, qr: "wechat" },
    { label: "小红书", href: "#", icon: <IconXiaohongshu />, qr: "xhs" },
    {
      label: "Email",
      href: conciergeContact.email ? `mailto:${conciergeContact.email}` : "#",
      icon: <IconEmail />,
    },
  ];

  return (
    <footer className="bg-ink pb-[calc(80px+env(safe-area-inset-bottom))] md:pb-[60px] [html.cookie-open_&]:pb-[calc(168px+env(safe-area-inset-bottom))] md:[html.cookie-open_&]:pb-[calc(132px+env(safe-area-inset-bottom))]">
      <div className="page-col pt-[52px] md:pt-14">
        <div className="grid items-start gap-9 md:mb-10 md:grid-cols-[1fr_auto_1fr] md:gap-12">
          <div className="text-center">
            <p className="text-2xl font-medium tracking-[0.06em] text-paper md:text-[26px]">
              {about.name.zh}
            </p>
            <p className="mx-auto mt-1 max-w-[280px] text-[11px] leading-4 text-[rgba(250,248,242,0.4)] md:max-w-none">
              {about.name.en}
            </p>
            <p className="mx-auto mt-3.5 max-w-[280px] text-[13px] leading-6 text-[rgba(250,248,242,0.5)] md:max-w-none">
              {t(about.brandSlogan)}
            </p>
          </div>
          <div className="hidden w-px self-stretch bg-[rgba(250,248,242,0.08)] md:block" />
          <div className="hidden md:block">
            <p className="mb-4 text-[10px] tracking-[0.12em] text-[rgba(250,248,242,0.3)] uppercase">
              {t(copy.footer.connect)}
            </p>
            <SocialRow socials={socials} onQr={openQr} />
          </div>
        </div>

        <div className="mt-8 h-px bg-[rgba(250,248,242,0.08)] md:hidden" />
        <div className="mt-8 text-center md:hidden">
          <p className="mb-[18px] text-[10px] tracking-[0.12em] text-[rgba(250,248,242,0.3)] uppercase">
            {t(copy.footer.connect)}
          </p>
          <SocialRow socials={socials} centered onQr={openQr} />
        </div>

        <div className="mt-7 h-px bg-[rgba(250,248,242,0.08)] md:mt-0 md:mb-6" />
        <div className="flex flex-col items-center justify-between gap-2.5 pb-2 text-center md:flex-row md:text-left">
          <p className="text-[11px] text-[rgba(250,248,242,0.28)]">
            © {year} {about.name.zh} · {about.name.en} · {t(copy.footer.rights)}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {(
              [
                { href: pathFor(locale, "privacy"), label: copy.footer.privacy },
                { href: pathFor(locale, "terms"), label: copy.footer.terms },
                { href: pathFor(locale, "disclaimer"), label: copy.footer.disclaimer },
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
      <QrDialog kind={qrOpen} onClose={closeQr} />
    </footer>
  );
}

function SocialRow({
  socials,
  centered,
  onQr,
}: {
  socials: { label: string; href: string; icon: ReactNode; qr?: QrContactKind }[];
  centered?: boolean;
  onQr: (kind: QrContactKind) => void;
}) {
  return (
    <div>
      <div className={`flex flex-wrap gap-2.5 ${centered ? "justify-center" : ""}`}>
        {socials.map((s) => {
          const kind = s.qr;
          if (kind) {
            return (
              <QrIconButton key={s.label} kind={kind} onOpen={() => onQr(kind)}>
                {s.icon}
              </QrIconButton>
            );
          }
          return (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              title={s.label}
              {...(s.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(250,248,242,0.1)] bg-[rgba(250,248,242,0.06)] text-[rgba(250,248,242,0.6)] hover:border-[rgba(250,248,242,0.22)] hover:bg-[rgba(250,248,242,0.12)] hover:text-paper"
            >
              {s.icon}
            </a>
          );
        })}
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
function IconXiaohongshu(p: P) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden {...p}>
      <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm.75 4.5h1.5v1h-1.5v3.25h-1V7.5H8.25v-1h1.5V5h1v1.5zm-3.5 5.25h5.5v1h-5.5v-1z" />
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
