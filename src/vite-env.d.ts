/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_ECHARIS_API_KEY: string;
  readonly VITE_MANDATE_SPORT_API_KEY: string;
  readonly VITE_NOTIFICATION_URL: string;
  readonly VITE_UTILITIES_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
