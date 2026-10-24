# Seal Stuff

**Current direction:** the production artist website hands shop, product, collection, account, cart and policy entry points to Shopify's native Online Store. Artist pages keep Ellie branding, artist navigation and their own sitemap. All custom ecommerce code remains available on localhost and branch previews as reference. See [hosted shop handoff, launch checks and current access status](setup/HOSTED-SHOP.md) and the **Native shop launch** GitHub Actions workflow for deployment verification. The implementation details below also document the retained custom storefront.

Svelte 5 artist website for Ellie Seal. `/` is an artist index with routes to the shop and murals. `/shop` brings together prints and original paintings; `/collections/[handle]` displays Shopify collections, with a spacious gallery for originals. `/murals` retains Ellie's portfolio and commission flow. Shopify manages catalogue, navigation, editorial content, cart and checkout. Prodigi fulfils mapped prints; original paintings are fulfilled by Ellie.

## Run

```sh
npm install
npm run dev
```

The shop is available by default. Run `npm run build` for production and `npm run preview` to inspect that build locally. Standard Vite options still work, for example `npm run dev -- --host 0.0.0.0 --port 5174`.

## Search and discovery

The shop no longer has a construction flag. Pages render on the server with individual titles, descriptions, canonical URLs, social previews and relevant structured data. Shopify's Search engine listing fields supply product, collection and merchant-page SEO. The Hull mural service page is at `/murals/hull` and is linked from `/murals`.

The canonical production origin defaults to `https://ellieseal.co.uk`, the website listed by Culture Hull. Override it with the **runtime** environment variable `PUBLIC_SITE_URL` if the public domain changes. Other deployment hosts, including localhost and Cloudflare branch previews, carry `noindex`; the public host's HTTP/www aliases redirect to the chosen HTTPS origin. Keep Cloudflare's domain routing configured for that public domain.

`/robots.txt` advertises `/sitemap.xml`. On the production artist domain it indexes only `/sitemap-pages.xml`; Shopify owns commerce indexing. Local/preview reference deployments retain `/sitemap-shop.xml`, which discovers published products, nonempty collections and Shopify Pages, includes modification times and image URLs, and returns a retryable 503 if its catalogue API is unavailable. Search, filter, account, saved and error pages are excluded from indexing.

See [SEO setup and checks](setup/SEO.md) for deployment verification, Search Console, local-business next steps and the research sources. Search Console submission and Business Profile management require the owner's account; they have not been performed by this code change.

Missing or partial Shopify configuration and API failures show an unavailable catalogue rather than demo products. The artist index and mural pages remain accessible. Review the account-side launch checks below before accepting orders.

## Launch checklist

### Storefront fixes and account review - 24 October 2026

Stock-aware product and bag controls read Shopify inventory and quantity rules; originals are limited to one across their variants. Enable `unauthenticated_read_product_inventory` on the Headless Storefront token to expose stock limits before cart updates. The catalogue continues to work without that scope, with Shopify enforcing stock. The confirmed product types are **Original painting** and **Art print**. Set the automatic Originals collection rule to **Original painting**; the create-only setup script reports older mismatched rules without overwriting merchant settings. Originals omit print selectors, print-size guides and print care copy. Optional product care content is managed in Shopify's public multi-line field `artwork.care_instructions`.

Collections open their own Shopify-managed pages, including links from older category menus. Only originals collection pages use the gallery layout; prints and Shop all retain the standard catalogue. Sort and variant controls share an accessible native select component.

The catalogue now uses a compact ecommerce heading, tighter filters and fixed image frames with full-image viewers. `/contact` reads Shopify's Contact page introduction while keeping email/order/mural details available. Footer credit links to Jayden Holdsworth's `jaydchw.com`.

Policies render locally from Shopify **Settings > Policies**. Shopify's native cookie banner is controlled in **Settings > Customer privacy**; footer controls reopen preferences and save separate data-sharing choices through Shopify's API, with success/error toasts. The same-origin consent proxy must be deployed with the app. `/account` now uses a local account dashboard and Shopify Customer Account API sign-in, profile, delivery address and order history. Its client ID and encrypted-session secret are separate, still-required setup values; see `.env.example` and [the account/privacy setup guide](setup/SHOPIFY-CONTENT.md). No live account or consent verification has been completed.

**Account checks remain incomplete.** The reported newsletter/password page is Shopify-hosted. Review **Online Store > access menu > Public/Launch store** (or **Preferences > Password protection** on older dashboards), then check checkout in a private browser window. Theme-design onboarding is separate from this Headless frontend. The latest review could not reach the signed-in Shopify/Prodigi accounts: both browser controls were unavailable and direct Shopify requests failed DNS resolution. Historical observations below must not be treated as a current account audit. The saved fulfilment record has 22/60 print mappings completed and 38 pending. See [checkout and Prodigi verification steps](setup/SHOPIFY-CONTENT.md) and `setup/fulfilment-status.json`.

### Account setup status — 13 October 2026

- **Connected:** Shopify Headless, public Storefront configuration locally and in Cloudflare production/preview secrets, customer account URL, and the Prodigi Shopify integration. Cloudflare build output is `.svelte-kit/cloudflare`; `.node-version` pins Node 24.
- **Catalogue:** six draft prints remain in Shopify and Prodigi. The four test clothing products were removed; clothing code and demo assets remain. All six Shopify products now have their original artwork images. All six originals were uploaded to Prodigi's image library.
- **Fulfilment remains incomplete:** exact progress is recorded in `setup/fulfilment-status.json`. Product, colour and artwork placements are being verified individually. Active Prodigi toggles do not mean fulfilment is configured. Do not launch from these partial settings.
- **Owner instruction:** A4 and A3 only, with A3 the largest, and all five finishes. A2 was removed from all six Shopify products and the local catalogue. Serve worldwide wherever Prodigi supports delivery. Do not pay, order samples or place fulfilment orders. The original files rate “Acceptable” at A4 and “Poor” at A3; no sample-quality claim has been made.
- **Still required:** Shopify identity and proof-of-address uploads for Payments; remaining variant mappings; destination availability and margin checks; international shipping rates/Markets; refund, shipping and terms policies; account/newsletter and checkout checks. Prodigi billing details and a primary payment method are present, with a two-hour order edit window saved. Paid samples and tracking checks are deferred by the owner.
- **Deployment:** the new shop is at [the Cloudflare preview](https://codex-shop-launch.ellie-exhibition-shop.pages.dev). The existing production site has not been replaced. Products remain draft, so the live-connected preview currently has no published catalogue. Publish approved products to Headless and deploy production only after the launch checks pass.

1. **Shopify:** create the store in GBP, configure payments, enable customer accounts and add the **Headless** channel. Give its **public Storefront token** product/cart access. Keep the Shopify-hosted storefront available for account, policy and newsletter pages.
2. **Products:** run `npm run catalog:export`, then import `setup/shopify-products.csv` into Shopify. It creates six **draft** print products with A4/A3 Size/Finish options (60 variants). Clothing is deferred; its code, data and mockups remain available. Use `npm run catalog:export -- --include-clothing` only when ready to add the four clothing products. Add artwork images and verify sizes, print specifications and retail prices. Activate finished products and publish them to the Headless channel.
3. **Prodigi:** create an account, connect Shopify, and map **every variant** to its actual Prodigi product, size, frame and print-ready file. The exported `SEAL-*` SKUs are your identifiers, not Prodigi product codes. Enable automatic fulfilment and billing in Prodigi. **No Prodigi key belongs in this website.**
4. **International sales:** enable the countries you serve in Shopify Markets and set shipping zones/rates, taxes and duties. Check Prodigi product availability and shipping cost for those destinations. Publish shipping, refund, privacy and terms policies in Shopify. Retail prices below exclude delivery.
5. **Cloudflare Pages:** use `npm run build`, output **`.svelte-kit/cloudflare`**, Node **24**. This replaces the old static `build` output. Add `PUBLIC_SHOPIFY_STORE_DOMAIN` (e.g. `your-shop.myshopify.com`) and `PUBLIC_SHOPIFY_STOREFRONT_TOKEN` from `.env.example` to Pages **runtime environment variables**; use API version `2026-07`. Enable `nodejs_compat` as in `wrangler.jsonc`. Redeploy. Never use an Admin API or private Storefront token in a `PUBLIC_` variable.
6. **Accounts & email:** configure the Customer Account API client, allowed callback/logout URLs and server-only settings documented in `setup/SHOPIFY-CONTENT.md`. This website's `/account` uses those credentials; the legacy hosted account URL is unused there. Enable email signup/double opt-in in Shopify. Test the newsletter form's hosted confirmation/captcha; if needed, set `PUBLIC_NEWSLETTER_URL` to a Shopify page containing a native newsletter form. Configure Shopify-hosted return links to this Cloudflare domain.
7. **Test, then launch:** check an international checkout, sign-in, newsletter consent, a real sample order through Prodigi and its tracking/fulfilment update in Shopify. Review colour, cropping, margins and frame quality before accepting customer orders.

Local live configuration: copy `.env.example` to `.env`, fill the same values and restart Vite. For the Cloudflare runtime, build and run `npm run preview:cloudflare` (Wrangler uses `.dev.vars` for local bindings; do not commit it).

## Provisional retail prices (GBP)

| Finish                        |  A4 |   A3 |
| ----------------------------- | --: | ---: |
| Poster                        | £35 |  £49 |
| Fine art print                | £49 |  £75 |
| Black / natural / white frame | £99 | £149 |

These are premium **retail proposals**, not verified cost-plus margins. Prodigi publicly lists classic frames from £16 excluding tax/shipping, but exact variant and regional costs require its dashboard. Confirm each margin using net retail revenue minus production, Shopify/payment fees, shipping subsidy, tax and a replacement reserve; allocate your monthly Shopify subscription across expected orders. Charge shipping separately initially. Sources: [Prodigi classic frames](https://www.prodigi.com/products/wall-art/framed-prints/classic-frames/), [fine art paper](https://www.prodigi.com/products/prints-and-posters/art-prints/enhanced-matte-art/), [fulfilment mapping](https://www.prodigi.com/shopify-print-on-demand-app/support/configure-your-products/).

The owner confirmed that `src/lib/assets/images/art-1.png` through `art-6.png` are the original available print files. Each is 2,360 × 1,640 pixels: approximately 198 ppi at A4 and 140 ppi at A3 when filling the sheet. Prodigi recommends 300 dpi for fine art and framed prints. Approve the layout and sample quality before launch; A3 may need higher-resolution scans. Available Prodigi formats may differ by region; remove unsupported variants before publishing.

## Clothing & promotions

T-shirts are proposed at **£42**, hoodies at **£85**, plus delivery. The initial palette is desert dust / black / white for tees and ash / black / white for hoodies. The draft sizing tables use internationally available blanks: [Stanley/Stella Creator 2.0](https://www.prodigi.com/products/mens-clothing/t-shirts/classic/stanley-stella-creator-sttu755/) and [AWDis JH001](https://www.prodigi.com/products/mens-clothing/hoodies/pullover/awdis-jh001/). Confirm fit, colour names, destination coverage and exact costs in Prodigi before publication. Comfort Colors 1717 is currently US-only, so it is not a worldwide launch option.

The dummy Cosmic Shard print has a **20% sale** across its variants. The sample reduction is not exported to Shopify. Live sale badges, crossed-out prices, the sale filter and announcement use Shopify variant **Compare-at price** greater than **Price**. Set those in Shopify to run a real sale. Discount codes and automatic checkout discounts are managed in Shopify; the bag displays Shopify totals. No fake countdowns or savings are inserted into live data.

Design and copy references: [Anthropic frontend-design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) and [Corey Haines copy-editing skill](https://github.com/coreyhaines31/marketingskills/blob/main/skills/copy-editing/SKILL.md).

## Where to edit

See [Managing Ellie's website](setup/SHOPIFY-CONTENT.md) for the dashboard workflows and one-time setup. The integration is implemented; Shopify content definitions, menus, collections, channel access and original delivery/pickup still need account-side configuration. `npm run shopify:setup` prints an offline plan; the documented `--apply` command creates missing resources with a server-only Admin credential. It never publishes products or changes fulfilment, inventory or shipping.

- Live products, options, prices, availability and descriptions: **Shopify**. Additional options and catalogue pages are read automatically. GBP is the display currency; international delivery is configured at checkout, not a multi-currency switcher.
- Categories and product ordering: **Shopify Products > Collections**. Main navigation and shop category links: **Content > Menus > Main menu** (`main-menu`). Footer links use the `footer` menu. New linked collections work without rebuilding the site.
- Homepage/shop introductions, images, About and FAQs: **Content > Metaobjects > Website content** (`storefront_content/main`). FAQ entries are selected and ordered there. Additional Shopify Pages linked in the menu render as safe plain-text paragraphs.
- Original paintings: set product type **Original painting**, track one item at Ellie's location, disable overselling and use manual fulfilment. Keep sold originals published and in their collection to retain them in the gallery. The website caps original quantities at one; Shopify stock is the final inventory protection.
- Clothing data: `src/lib/content/clothing.json`; regenerate the editable SVG garment illustrations with `node scripts/create-clothing-mockups.mjs`. Illustrations are design concepts, not supplier photography or production files. Replace them with approved Prodigi mockups in Shopify.
- Demo prices/sizes: `src/lib/content/print-options.json`; demo artwork descriptions: `src/lib/art.ts`.
- Homepage and About layouts: `src/routes/+page.svelte` and `src/routes/about/+page.svelte`; social/contact destinations: `src/lib/content/site.ts`.
- Offline editorial defaults: `src/lib/content/storefront.ts`. Static contact/newsletter labels: `src/lib/content/shop.ts`.
- Shop theme: `src/routes/shop.css`; original shared palette: `src/routes/layout.css`.
- Commerce API/data types: `src/lib/commerce/`. Per-visitor cart/wishlist state is created in the root layout, not a server singleton. Only a public Storefront token reaches the browser.
- Murals: `src/lib/components/murals/mural-page.svelte` and `src/lib/content/murals.ts`. Hull-specific content: `src/lib/content/hull-murals.ts`.

Cart mutations use Shopify's Storefront API through the consent-aware same-origin proxy and redirect to its refreshed checkout URL; the client cannot set live prices. Accounts use Shopify-hosted secure authentication and return to the local account dashboard. Newsletter consent is posted to Shopify's native customer form and confirmation occurs there; the site never invents a signup success. Saved pieces are browser-local. Old `/art` URLs redirect to the corresponding shop routes.

## Verify

```sh
npm run check
npm run test
npm run lint
npm run build
```

Tests cover API failures, expired carts, inventory errors, cart mutations and catalogue/variant pagination. Live payments, email delivery and Prodigi fulfilment need the account-side checks above.

Dependency note: compatible security patches have been applied. The remaining audit advisories are in the existing SvelteKit 2 cookie dependency and build/development tooling (Tailwind selector parsing and Wrangler/Miniflare image handling); a major framework/toolchain upgrade is outside this storefront rebuild. Recheck with npm audit before launch.
