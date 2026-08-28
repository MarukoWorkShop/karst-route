/** Prefix public files with Vite `base` (GitHub Pages lives at /karst-route/). */
export function asset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
