/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEB3FORMS_ACCESS_KEY?: string;
  readonly VITE_HERO_MEDIA_BASE?: string;
  readonly VITE_HERO_VIDEO_OFF?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
