/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    /** Enable authentication features ("true" | "false") */
    readonly VITE_ENABLE_AUTH?: string
  }
}

export {}
