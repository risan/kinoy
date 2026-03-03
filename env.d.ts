/// <reference types="vite/client" />

interface Window {
  google?: {
    maps?: {
      places?: unknown;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}
