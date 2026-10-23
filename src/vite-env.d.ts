/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ICON_CDN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
