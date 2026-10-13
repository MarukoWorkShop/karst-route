import { useEffect, useState, type ReactNode } from "react";
import { IconClose } from "@/components/icons";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { asset } from "@/lib/asset";

/** 页脚微信客服号。二维码内容与此号码一致。 */
export const WECHAT_ID = "13507735008";

const QR_SRC = asset("concierge/wechat-qr.png");

const ICON_BTN =
  "flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(250,248,242,0.1)] bg-[rgba(250,248,242,0.06)] text-[rgba(250,248,242,0.6)] hover:border-[rgba(250,248,242,0.22)] hover:bg-[rgba(250,248,242,0.12)] hover:text-paper";

export function WechatIconButton({
  children,
  onOpen,
}: {
  children: ReactNode;
  onOpen: () => void;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        aria-label="微信"
        aria-haspopup="dialog"
        title="微信"
        onClick={onOpen}
        className={ICON_BTN}
      >
        {children}
      </button>
      <div className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-30 hidden w-[148px] -translate-x-1/2 group-hover:block">
        <div className="relative rounded-xl bg-paper p-2 shadow-[0_12px_32px_rgba(16,28,22,0.28)]">
          <img
            src={QR_SRC}
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

export function WechatDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

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

  if (!open) return null;

  async function copyId() {
    try {
      await navigator.clipboard.writeText(WECHAT_ID);
      setCopied(true);
      return;
    } catch {
      /* 浏览器拦住剪贴板接口时，改用选区复制 */
    }
    const field = document.createElement("textarea");
    field.value = WECHAT_ID;
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
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="微信"
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
          src={QR_SRC}
          alt={WECHAT_ID}
          width={200}
          height={200}
          className="mx-auto h-[200px] w-[200px] max-w-none rounded-md"
        />
        <p className="mt-3 text-[13px] text-ink-soft">{t(copy.footer.wechatScan)}</p>
        <p className="mt-1 text-[16px] font-medium tracking-[0.04em] text-ink">{WECHAT_ID}</p>
        <button
          type="button"
          onClick={() => void copyId()}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-cta text-[14px] font-medium text-paper"
        >
          {copied ? t(copy.footer.wechatCopied) : t(copy.footer.wechatCopy)}
        </button>
      </div>
    </div>
  );
}
