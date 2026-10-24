# Shopify-hosted shop handoff

The public artist site should send shoppers to the native Shopify Online Store. The existing Svelte ecommerce implementation is preserved as reference; no product, bag, account, consent or storefront component was removed or rewritten for this switch.

## Latest launch attempt

**Verified outcome:** no GitHub push or new Cloudflare deployment occurred in this attempt. The connected GitHub account is `fr0derick`; the repository belongs to `Jaydchw`. Both a small intended source-tree write and a 146 KB public-pricing blob upload returned HTTP 403 **Resource not accessible by integration**. Read access and the repository user-permissions response did not establish actual connector write access. Reconnect GitHub with repository Contents write access as the owner/authorized collaborator before resuming. Do not mistake a prepared snapshot for a pushed commit.

Remote main remains `c0d93c43011ff6f993cb0b7e12a705540f69064f`. Its Cloudflare Pages check confirms the existing Git integration previously deployed successfully. A new main push should use that integration, but its new check and public responses must still be verified. A snapshot from the attempted public-source push is retained in ignored `.wrangler/github-push-snapshot.json`; it excludes the private files below. Regenerate it from the current files before retrying because this handoff was updated after the denied push. The Shopify theme remains unpublished because publication was blocked by the connector and requires the owner's manual action.

The owner has explicitly authorized pushing the existing uncommitted work to GitHub and making the artist-site handoff and native shop live. **Prodigi is deferred and must be left unchanged.** Its earlier audit is retained as reference; it is no longer a reason to withhold the theme/routing launch. The six imported print products remain drafts, and existing active products retain their stock/fulfilment settings.

The production artist shell now consistently uses Ellie branding and artist navigation on About, Contact and Help too. Custom saved/cart/account utilities, the commerce newsletter and headless privacy bootstrap are gated off on the production artist domain; their implementations remain available on localhost/previews. Saved and policy entry points redirect to Shopify. The production sitemap indexes only artist pages; its old commerce sitemap is empty, with preview/headless sitemap behavior preserved. OnlineStore structured data names the native shop.

The complete local suite passes **146 tests**, and Svelte check reports **0 errors / 0 warnings**. The production build succeeds. The routing defaults to `pr8fqg-6y.myshopify.com` when the public store-domain environment variable is blank, so a missing Storefront credential cannot prevent the public handoff.

Public GitHub publication excludes the local `shopify-native/audit/` data, the machine-specific Codex configuration, and the new changes to `setup/fulfilment-status.json`. Automatic review rejected uploading the detailed private inventory/integration audit to a public repository. Those local files remain intact; do not transfer equivalent private metadata by another method. The large public supplier-pricing reference uses a one-time compressed transfer workflow that restores the exact Git blob and removes its temporary transfer files.

The connected Shopify tool refused `themePublish` with an automatic approval-review block: **Publishing a theme must be done manually in Shopify admin to prevent accidental storefront changes.** User authorization was already explicit; this is a connector restriction. The owner was given the prepared theme's admin link. Do not work around this rejection by replacing the currently published theme's files. The prepared theme remains `212416823687`; assign the original product/collection templates after it becomes MAIN.

The connector also lacks `read_privacy_settings` and `write_legal_policies`, so cookie-banner settings and legal-policy writes are unavailable. A Privacy policy and data-sharing choices page already exist. No new policy was invented. Browser helpers still fail to start, and local Wrangler cannot refresh its expired login over the blocked shell network.

The repository now includes `.github/workflows/native-shop-launch.yml`: it runs installation, Svelte checks, tests and a production build on main pushes. It can deploy the existing Cloudflare Pages project if the repository has `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets; otherwise it reports that credentials are absent and checks whether the existing Cloudflare Git integration has deployed the commit. Its read-only browser smoke report/screenshots distinguish the current public theme from the unpublished draft, verify cart-only behavior without submitting checkout, and poll the public artist redirect. Use the workflow result and verified public responses for deployment status, rather than treating a pushed commit as proof that deployment happened.

The historical implementation/access record below remains for context. The latest launch instructions and actual workflow results take precedence.

## Routing

On the canonical production origin (`PUBLIC_SITE_URL`, currently `https://ellieseal.co.uk`):

| Artist-site URL                  | Shopify destination              |
| -------------------------------- | -------------------------------- |
| `/shop`                          | Online Store homepage            |
| `/shop?category=prints`          | `/collections/prints`            |
| `/shop?category=originals`       | `/collections/originals`         |
| `/shop?q=...`                    | Shopify product search           |
| `/shop?search=1`                 | Native product search page       |
| `/shop/product-handle`           | `/products/product-handle`       |
| `/collections/collection-handle` | `/collections/collection-handle` |
| `/account`, `/account/login`     | `/account`                       |
| `/cart`                         | `/cart`                          |

The request hook redirects before fetching the custom catalogue. Redirects are temporary (`302`) with `no-store` while store launch configuration is being completed. Localhost and branch previews keep the existing custom shop available for reference. Artist pages and OAuth callbacks are unchanged.

The destination uses `https://PUBLIC_SHOPIFY_STORE_DOMAIN`, falling back to `https://pr8fqg-6y.myshopify.com` when unset. Set the optional **server-only runtime** variable `SHOPIFY_ONLINE_STORE_URL` to a different Shopify-hosted HTTPS origin if using a branded store subdomain, for example `https://shop.ellieseal.co.uk`. Connect that subdomain in Shopify and DNS before selecting it here. Keep the main artist domain pointing to the existing artist website. The redirect opens Shopify's URL; it does not reverse-proxy Shopify beneath `/shop`.

## Native store setup still to verify

1. Inspect the store's existing theme and configure its colours, typography, menus and homepage using Ellie's existing art. Keep a theme backup and preserve products and fulfilment mappings.
2. Make approved products and collections available to **Online Store**, in addition to any existing Headless publication. The confirmed product types are **Art print** and **Original painting**. Check the Originals collection condition uses the latter.
3. Use separate print/original templates where needed. Keep originals tracked at one with overselling disabled and manual fulfilment; preserve each print's Prodigi mapping.
4. Add links from the Shopify shop to the existing artist website, About, Murals and Contact pages. Keep store categories and account/cart links native to Shopify.
5. Review **Settings > Policies**, **Customer privacy**, customer accounts, shipping, payments and store access. Remove the password restriction only when the store is ready. No payment, subscription or fulfilment order is authorized by this routing change.
6. Verify every currently sold print variant in Prodigi before relying on automatic fulfilment. The saved historical setup record still lists incomplete mappings; it is not a live audit.
7. Deploy the artist-site build to Cloudflare and test the actual public `/shop` response, native browsing, account access and checkout without placing an order.

## Current state — 24 October 2026

The connected `mcp__codex_apps__shopify_*` tools now provide authenticated Admin API access to **Seal Stuff**, `pr8fqg-6y.myshopify.com`. The separate `mcp__shopify__*` connection returns Authentication required. Do not assume that installing a second Shopify connection is necessary: the first connection works for catalogue, navigation, content and theme operations.

### Saved to the existing Shopify store

- Created and Online Store-published `/collections/prints`, rule **TYPE EQUALS Art print**, and `/collections/originals`, rule **TYPE EQUALS Original painting**. The only previous collection was Home page; there were no existing category rules to repair.
- Main menu now links Shop, Prints, Originals, Artist website, Murals and Contact. The native header references `main-menu`.
- Footer menu now contains Contact Ellie, About Ellie, Instagram, native Privacy policy, native Your Privacy Choices, and **Created by Jayden Holdsworth** linked to `https://jaydchw.com`. The prepared theme renders this menu; the currently published stock Horizon footer does not render a footer menu, so its credit is not yet visible publicly.
- Contact page now contains Ellie's supplied email/Instagram, order-enquiry guidance, and artist/murals links. Its native contact template and form remain in place.
- Read back the collections, rules, publication state, menus and Contact content after saving; no returned user errors.

### Theme prepared in Shopify, not published

The existing **Horizon** theme (`211213123975`) remains the published theme. It was duplicated as **Seal Stuff — artist shop** (`212416823687`), role **UNPUBLISHED**. Twelve adapted files were uploaded to that copy. No theme was purchased.

Source is isolated in `shopify-native/theme/`. Original versions of the downloaded theme files are in `shopify-native/backup-horizon-2026-10-24/`; this is a sparse backup of the edited areas, not a complete downloadable theme. The original published theme also remains intact in Shopify. Do not push the sparse directory using a command that deletes remote files.

The draft has cream/navy/sage styling, native DM Sans/Cormorant fonts, contained artwork frames, native image zoom, a conventional prints grid and an originals gallery template. It keeps Horizon's native cart, variant selection, purchase, account, contact and privacy mechanisms. Its separate `product.original.json` removes size/finish and quantity controls; neither product template includes invented care copy or print-specific original labels. The home uses actual collection products and hides empty featured collections.

All twelve files were read back from Shopify. Liquid/CSS matched uploaded content; JSON settings matched semantically after Shopify's normal whitespace/comment normalization and omission of empty static block-order arrays. Theme processing completed without failure. Shopify initially rejected an unsupported `closest.product.type` dynamic source in both product templates; it was removed, and both templates then saved without errors.

Ten local JSON files parsed, and 867 template/group settings were checked against fetched Horizon schemas with no invalid select/range values. The Admin operations passed the Shopify validator. Full Liquid theme checking could not start because the skill installation lacks `@shopify/theme-check-common`. Browser rendering, zoom interaction, cart/variant interaction, checkout and actual sign-in remain untested; do not describe API acceptance as visual or end-to-end verification.

Preview the draft in the Shopify theme editor. After preview and the remaining launch checks, publish the draft and assign `product.original` to the existing original painting and `collection.originals` to the Originals collection. Those resource template assignments have **not** been made while the templates exist only in the unpublished copy. Preview alternate templates with `view=original` / `view=originals` where needed.

Theme verification record: `shopify-native/audit/theme-upload-2026-10-24.json`.

### Live catalogue, accounts and privacy audit

- Eight products / 62 variants exist. Six imported print products remain **DRAFT**, each with the exact ten A4/A3 × Poster/Fine art print/Black frame/Natural frame/White frame variants. Their publication/status, prices, SKUs, options and artwork were preserved.
- The active original **Oil Painting : 'Looking up and Forwards'** has one default variant, physical shipping, tracked available stock **1**, inventory policy **DENY**, and only the manual fulfilment location. No inventory mutation was necessary.
- The separate active **Print: Looking up and Forwards** has one default variant, stock 10 and no SKU. Do not invent its dimensions, finish or supplier, or convert it into the six imported print products.
- Native **NEW_CUSTOMER_ACCOUNTS** is already enabled, login links are visible, and the account menu contains Orders and Profile. Its configured account URL is `https://shopify.com/110487110023/account`. No customer was created and no email/code was sent to test sign-in.
- The Online Store is not password-protected. UK and US markets are active; these observations do not establish checkout/payment readiness.
- Shopify currently has a native Privacy policy and a native Your Privacy Choices page. No refund, shipping or terms-of-service policy exists in the returned policy list. No policy text was fabricated.
- The GB consent policy requires consent. Reading the actual cookie-banner/automatic-privacy configuration returns **Access denied: read_privacy_settings**. The existing page/policy alone does not prove the banner is enabled or correctly configured. Payment account inspection similarly lacks the required Shopify Payments read scope.

### Prodigi audit — still a launch blocker

`shopify-native/audit/fulfilment-live-2026-10-24.json` records all 62 live variants and separately marks expected/historical supplier specifications. **Zero supplier mappings were verified live**; the 22/60 mapping count remains a historical observation dated 13 October, not a new result.

Prodigi is installed and its fulfilment location is active, but supplier product, uploaded artwork, frame colour, saved size and automatic fulfilment are not exposed in accessible Shopify metadata. All 60 draft print inventory records currently use the manual location with untracked stock and CONTINUE; app-side mapping cannot be inferred from that either way. Do not publish those draft prints until the authenticated Prodigi dashboard has been inspected variant by variant.

The original is correct on Shopify's inventory side, but its **Ignore** state inside Prodigi remains unverified. Confirm that exclusion explicitly before relying on manual fulfilment. No order or sample was placed and no charge was incurred.

### Artist-site redirect and deployment

The handoff also now routes production GET/HEAD `/account` and `/account/login` to native Shopify `/account`, and `/cart` to native Shopify `/cart`. OAuth callbacks, nested account/cart endpoints, request bodies, localhost and previews retain existing behavior. These additions only modify the handoff helper and its tests; the Svelte ecommerce implementation remains intact.

Validation: **10/10 redirect tests**, Svelte check **0 errors / 0 warnings**, and a successful Cloudflare production build. The redirect has **not been deployed**. The main artist domain and DNS were not changed.

Deployment is blocked: Wrangler's stored token is expired and cannot refresh because the current shell cannot resolve/reach Cloudflare. Direct checks also fail DNS for the Shopify domain and npm registry. Browser Use exits with `trusted Node process exited unexpectedly`; Windows Computer Use reports `failed to launch codex app-server: program not found`. Neither browser route could inspect Shopify/Prodigi or public checkout.

Once store launch checks pass and Cloudflare access works, rebuild and deploy the whole preserved working tree using the existing project:

```powershell
npm run build
node node_modules/wrangler/bin/wrangler.js pages deploy .svelte-kit/cloudflare --project-name ellie-exhibition-shop --branch main --commit-dirty=true
```

Review the working tree before deployment: it includes substantial earlier uncommitted changes, not just this handoff. Do not reset, clean, stash or replace them. Verify actual public redirects and artist pages after deployment.

The later production handoff changes described at the top of this file resolve the shared artist-shell and commerce-sitemap issues without deleting the reference implementation.
