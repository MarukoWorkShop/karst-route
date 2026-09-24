/** 模块二红心与模块三深度定制共用同一份本地标记。 */

export const LIKES_KEY = "light-sku-likes-v1";

export function likeKey(categoryId: string, routeId: string) {
  return `${categoryId}:${routeId}`;
}

export function readLikes(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

export function writeLikes(set: Set<string>) {
  localStorage.setItem(LIKES_KEY, JSON.stringify([...set]));
  window.dispatchEvent(new Event("light-likes"));
}
