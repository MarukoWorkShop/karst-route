/** 询单发送超时时间：境外服务在弱网下可能长时间挂起，必须自己掐断。 */
const TIMEOUT_MS = 15_000;

/**
 * 发送询单到管家（web3forms）。
 *
 * - 未配置 access key 时**不再假装成功**，返回 false 让界面显示失败
 * - 自带 15 秒超时：网络挂起时也能结束等待，避免按钮永远停在「发送中」
 * - 失败一律返回 false，由调用方决定提示文案
 */
export async function sendEnquiry(fields: Record<string, string>): Promise<boolean> {
  const key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (!key) {
    console.warn("[enquiry] 未配置 VITE_WEB3FORMS_ACCESS_KEY，询单未发送");
    return false;
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ access_key: key, ...fields }),
      signal: ctrl.signal,
    });
    const json = (await res.json()) as { success?: boolean };
    return Boolean(json.success);
  } catch (err) {
    console.warn("[enquiry] 询单发送失败（超时或网络不可达）", err);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export function labelsOf(
  ids: string[],
  items: readonly { id: string; label: { en: string; zh: string } }[],
  locale: "en" | "zh",
): string[] {
  return ids
    .map((id) => items.find((item) => item.id === id)?.label[locale])
    .filter((v): v is string => Boolean(v));
}
