/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OWNER_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
