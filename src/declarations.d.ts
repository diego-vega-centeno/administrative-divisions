declare module "*.css" {
  const classes: { [key: string]: string };
  export default classes;
}

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_GOOGLE_AUTH_URL: string;
  readonly VITE_OSM_AUTH_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  jQuery: typeof jQuery;
  $: typeof jQuery;
}