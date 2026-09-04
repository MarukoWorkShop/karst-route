import type { RouteId } from "@/types";

/**
 * Per-route media under public/tours/{r1|r2|r3}/.
 * Replace files in place — no code change needed.
 *   cover.jpg, gallery-1..3.jpg, intro.mp4 (optional)
 */
export type RouteMedia = {
  cover: string;
  gallery: [string, string, string];
  /** Relative path; player shows a slot until the file exists */
  video: string;
};

export const routeMedia: Record<RouteId, RouteMedia> = {
  r1: {
    cover: "tours/r1/cover.jpg",
    gallery: ["tours/r1/gallery-1.jpg", "tours/r1/gallery-2.jpg", "tours/r1/gallery-3.jpg"],
    video: "tours/r1/intro.mp4",
  },
  r2: {
    cover: "tours/r2/cover.jpg",
    gallery: ["tours/r2/gallery-1.jpg", "tours/r2/gallery-2.jpg", "tours/r2/gallery-3.jpg"],
    video: "tours/r2/intro.mp4",
  },
  r3: {
    cover: "tours/r3/cover.jpg",
    gallery: ["tours/r3/gallery-1.jpg", "tours/r3/gallery-2.jpg", "tours/r3/gallery-3.jpg"],
    video: "tours/r3/intro.mp4",
  },
};
