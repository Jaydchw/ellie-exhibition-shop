// Vite embeds the same setting in the browser and server bundles. Closed by default;
// npm run dev/build -- --construction=false explicitly enables the storefront.
declare const __SHOP_UNDER_CONSTRUCTION__: boolean;

export const storefrontOpen: boolean = !__SHOP_UNDER_CONSTRUCTION__;
