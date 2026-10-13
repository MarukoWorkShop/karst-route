import { useEffect, useState, type ReactNode } from "react";
import { IconClose } from "@/components/icons";
import { copy, type Tx } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { asset } from "@/lib/asset";

/** 页脚可扫码的社交号。二维码内容与号码一致。 */
export const QR_CONTACTS = {
  wechat: {
    id: "13507735008",
    label: "微信",
    qr: asset("concierge/wechat-qr.png"),
    copy: copy.footer.wechatCopy,
  },
  xhs: {
    id: "49321925599",
    label: "小红书",
    qr: asset("concierge/xhs-qr.png"),
    copy: copy.footer.xhsCopy,
  },
} as const;

export type QrContactKind = keyof typeof QR_CONTACTS;

const ICON_BTN =
  "flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(250,248,242,0.1)] bg-[rgba(250,248,242,0.06)] text-[rgba(250,248,242,0.6)] hover:border-[rgba(250,248,242,0.22)] hover:bg-[rgba(250,248,242,0.12)] hover:text-paper";

export function QrIconButton({
  kind,
  children,
  onOpen,
}: {
  kind: QrContactKind;
  children: ReactNode;
  onOpen: () => void;
}) {
  const contact = QR_CONTACTS[kind];
  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={contact.label}
        aria-haspopup="dialog"
        title={contact.label}
        onClick={onOpen}
        className={ICON_BTN}
      >
        {children}
      </button>
      <div className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-30 hidden w-[148px] -translate-x-1/2 group-hover:block">
        <div className="relative rounded-xl bg-paper p-2 shadow-[0_12px_32px_rgba(16,28,22,0.28)]">
          <img
            src={contact.qr}
            alt=""
            width={132}
            height={132}
            className="block h-[132px] w-[132px] max-w-none"
          />
          <span className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-paper" />
        </div>
      </div>
    </div>
  );
}

export function QrDialog({
  kind,
  onClose,
}: {
  kind: QrContactKind | null;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const open = kind !== null;
  const contact = kind ? QR_CONTACTS[kind] : null;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  if (!contact) return null;

  async function copyId(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      return;
    } catch {
      /* 浏览器拦住剪贴板接口时，改用选区复制 */
    }
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    setCopied(ok);
  }

  return (
    <QrDialogBody
      label={contact.label}
      id={contact.id}
      qr={contact.qr}
      copyLabel={contact.copy}
      copied={copied}
      onCopy={() => void copyId(contact.id)}
      onClose={onClose}
      t={t}
    />
  );
}

function QrDialogBody({
  label,
  id,
  qr,
  copyLabel,
  copied,
  onCopy,
  onClose,
  t,
}: {
  label: string;
  id: string;
  qr: string;
  copyLabel: Tx;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
  t: (tx: Tx) => string;
}) {
  return (
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <button
        type="button"
        aria-label={t(copy.nav.close)}
        onClick={onClose}
        className="absolute inset-0 bg-night/55 backdrop-blur-[2px]"
      />
      <div className="relative w-full max-w-[320px] rounded-xl bg-paper px-6 pt-8 pb-6 text-center shadow-[0_24px_64px_rgba(22,36,30,0.18)]">
        <button
          type="button"
          aria-label={t(copy.nav.close)}
          onClick={onClose}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-sage"
        >
          <IconClose className="h-4 w-4" />
        </button>
        <img
          src={qr}
          alt={id}
          width={200}
          height={200}
          className="mx-auto h-[200px] w-[200px] max-w-none rounded-md"
        />
        <p className="mt-3 text-[13px] text-ink-soft">{t(copy.footer.wechatScan)}</p>
        <p className="mt-1 text-[16px] font-medium tracking-[0.04em] text-ink">{id}</p>
        <button
          type="button"
          onClick={onCopy}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-cta text-[14px] font-medium text-paper"
        >
          {copied ? t(copy.footer.wechatCopied) : t(copyLabel)}
        </button>
      </div>
    </div>
  );
}
