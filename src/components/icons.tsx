import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function I(props: P) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    />
  );
}

export const IconGlobe = (p: P) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </I>
);
export const IconQuote = (p: P) => (
  <I {...p}>
    <path d="M4 19V8a3 3 0 0 1 3-3h4v8H7a3 3 0 0 0-3 3Z" />
    <path d="M13 19V8a3 3 0 0 1 3-3h4v8h-4a3 3 0 0 0-3 3Z" />
  </I>
);
export const IconTools = (p: P) => (
  <I {...p}>
    <rect x="4" y="4" width="6" height="6" rx="1" />
    <rect x="14" y="4" width="6" height="6" rx="1" />
    <rect x="4" y="14" width="6" height="6" rx="1" />
    <rect x="14" y="14" width="6" height="6" rx="1" />
  </I>
);
export const IconClose = (p: P) => (
  <I {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </I>
);
export const IconChevron = (p: P) => (
  <I {...p}>
    <path d="M7 10l5 5 5-5" />
  </I>
);
export const IconSwap = (p: P) => (
  <I {...p}>
    <path d="M7 7h11M15 4l3 3-3 3M17 17H6M9 14l-3 3 3 3" />
  </I>
);
export const IconExternal = (p: P) => (
  <I {...p}>
    <path d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6v6M10 14 20 4" />
  </I>
);
export const IconPassport = (p: P) => (
  <I {...p}>
    <rect x="6" y="3" width="12" height="18" rx="2" />
    <circle cx="12" cy="11" r="3" />
    <path d="M8 17h8" />
  </I>
);
export const IconCar = (p: P) => (
  <I {...p}>
    <path d="M4 13h16l-1.5-5H5.5L4 13Z" />
    <path d="M6 16h.01M18 16h.01M4 13v3h16v-3" />
  </I>
);
export const IconHeadset = (p: P) => (
  <I {...p}>
    <path d="M4 13a8 8 0 0 1 16 0" />
    <path d="M4 13v4a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2Z" />
    <path d="M20 13v4a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" />
  </I>
);
export const IconClock = (p: P) => (
  <I {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8v4.5L15 14" />
  </I>
);
export const IconTakeoff = (p: P) => (
  <I {...p}>
    <path d="M3 19h18" />
    <path d="M5 16 20 9.5 18 6l-7.2 3.2L7.2 6.2 5 7l3.2 4.2L5 12.2Z" />
  </I>
);
export const IconLanding = (p: P) => (
  <I {...p}>
    <path d="M3 20h18" />
    <path d="M5 10.5 20 15l-1.6 3-7.4-3.4-4 2.7L5 16.5 6.6 12Z" />
  </I>
);
export const IconUsers = (p: P) => (
  <I {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <circle cx="17" cy="9" r="2.2" />
    <path d="M16 19a4.5 4.5 0 0 1 4.5-4.2" />
  </I>
);
export const IconSparkles = (p: P) => (
  <I {...p}>
    <path d="M12 3.5 13.6 8.4 18.5 10 13.6 11.6 12 16.5 10.4 11.6 5.5 10 10.4 8.4Z" />
    <path d="M18 14.5 18.7 16.6 20.8 17.3 18.7 18 18 20.1 17.3 18 15.2 17.3 17.3 16.6Z" />
    <path d="M6.2 14.8 6.7 16.4 8.3 16.9 6.7 17.4 6.2 19 5.7 17.4 4.1 16.9 5.7 16.4Z" />
  </I>
);
export const IconGrip = (p: P) => (
  <I {...p}>
    <path d="M8 7h8M8 12h8M8 17h8" />
  </I>
);
export const IconCamera = (p: P) => (
  <I {...p}>
    <path d="M4 8h3l1.5-2h7L17 8h3v11H4V8Z" />
    <circle cx="12" cy="13" r="3" />
  </I>
);
export const IconBowl = (p: P) => (
  <I {...p}>
    <path d="M5 11h14v2a7 7 0 0 1-14 0v-2Z" />
    <path d="M8 11V8m4 3V7m4 4V8" />
  </I>
);
export const IconBed = (p: P) => (
  <I {...p}>
    <path d="M3 18V9h7a4 4 0 0 1 4 4v5" />
    <path d="M3 14h18v4M14 9h7v5" />
  </I>
);
export const IconPlay = (p: P) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" stroke="none" />
  </I>
);
export const IconStar = (p: P) => (
  <I {...p}>
    <path d="M12 3.5 14.2 9l5.8.6-4.4 3.8 1.3 5.6L12 16.4 6.1 19l1.3-5.6L3 9.6 8.8 9 12 3.5Z" />
  </I>
);
