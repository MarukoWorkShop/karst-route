/**
 * Public files under Vite `base`. GitHub Pages lives at `/karst-route/`;
 * Vercel is `/`. Destination photos stay in `public/destinations/` — do not
 * point them at COS while that bucket is in arrears (HTTP 451).
 */
export function asset(path: string) {
  const p = path.replace(/^\//, "");
  return `${import.meta.env?.BASE_URL ?? "/"}${p}`;
}
