# Seal Stuff

Svelte 5 artist website for Ellie Seal. `/` is an artist index with social and contact links and routes to the shop and murals. `/shop` offers prints, posters, framed art and clothing; `/murals` retains Ellie’s portfolio and commission flow. Shopify owns the live catalogue, cart, checkout, customer accounts and email subscribers. Prodigi fulfils orders through its Shopify integration.

## Run

```sh
npm install
npm run dev
```

The shop is under construction by default. Choose the view when starting the dev server:

```sh
npm run dev -- --construction=true
npm run dev -- --construction=false
```

Restart the dev server to switch modes. Other Vite options still work, for example `npm run dev -- --construction=false --host 0.0.0.0 --port 5174`. `--construction` accepts only `true` or `false`.

For a build, use `npm run build -- --construction=true` or `npm run build -- --construction=false`. Both the browser and server use that build's setting; `npm run preview` and deployed sites keep the setting from the build. You can also set `SHOP_UNDER_CONSTRUCTION=true` or `false` in `.env` or the deployment **build** environment. The command-line flag takes priority. Changing a deployed runtime environment variable alone does not change this setting: rebuild to switch it.

While construction is enabled, ecommerce pages show a non-interactive grid of existing artwork behind a construction notice and navy tape below the navbar. The artist index at `/` and the portfolio and commission/contact flow at `/murals` remain active. The navbar and footer stay usable, with no modal or scroll locking. The decorative backdrop has no prices or shopping controls. No live catalogue, cart, account or newsletter is loaded, and no Shopify requests are made while closed, even with credentials configured. The sitemap lists `/` and `/murals`. Demo products are no longer a storefront fallback.

Setting `--construction=false` restores the ecommerce pages for testing. Missing/partial Shopify configuration and API failures show an unavailable catalogue rather than demo products. The artist index and murals remain accessible, and the sitemap keeps those public pages while omitting unavailable shop URLs. Keep production under construction until the launch checks below are complete.

## Launch checklist

### Account setup status — 6 October 2026

- **Connected:** Shopify Headless, public Storefront configuration locally and in Cloudflare production/preview secrets, customer account URL, and the Prodigi Shopify integration. Cloudflare build output is `.svelte-kit/cloudflare`; `.node-version` pins Node 24.
- **Catalogue:** six draft prints remain in Shopify and Prodigi. The four test clothing products were removed; clothing code and demo assets remain. All six Shopify products now have their original artwork images. All six originals were uploaded to Prodigi's image library.
- **Fulfilment remains incomplete:** exact progress is recorded in `setup/fulfilment-status.json`. Cosmic Shard's A4/A3 fine-art placements are saved, but the product is inactive while 13 temporary copied assignments are rebuilt. Love Is the Key's A2 black/natural frames are saved; four further supplier assignments still need artwork. The other products remain unconfigured. Active Prodigi toggles do not mean fulfilment is configured. Do not launch from these partial settings.
- **Owner instruction:** retain all A4/A3/A2 sizes and all five finishes. Do not pay, order samples or place fulfilment orders. The original files rate “Acceptable” at A4 and “Poor” at the observed A3/A2 placements; no sample-quality claim has been made.
- **Still required:** Shopify payment/address verification; a card or PayPal in Prodigi; remaining variant mappings; destination availability and margin checks; international shipping rates/Markets; refund, shipping and terms policies; account/newsletter and checkout checks. Paid samples and tracking checks are deferred by the owner.
- **Deployment:** the new shop is at [the Cloudflare preview](https://codex-shop-launch.ellie-exhibition-shop.pages.dev). The existing production site has not been replaced. Products remain draft, so the live-connected preview currently has no published catalogue. Publish approved products to Headless and deploy production only after the launch checks pass.

1. **Shopify:** create the store in GBP, configure payments, enable customer accounts and add the **Headless** channel. Give its **public Storefront token** product/cart access. Keep the Shopify-hosted storefront available for account, policy and newsletter pages.
2. **Products:** run `npm run catalog:export`, then import `setup/shopify-products.csv` into Shopify. It creates six **draft** print products with Size/Finish options (90 variants). Clothing is deferred; its code, data and mockups remain available. Use `npm run catalog:export -- --include-clothing` only when ready to add the four clothing products. Add artwork images and verify sizes, print specifications and retail prices. Activate finished products and publish them to the Headless channel.
3. **Prodigi:** create an account, connect Shopify, and map **every variant** to its actual Prodigi product, size, frame and print-ready file. The exported `SEAL-*` SKUs are your identifiers, not Prodigi product codes. Enable automatic fulfilment and billing in Prodigi. **No Prodigi key belongs in this website.**
4. **International sales:** enable the countries you serve in Shopify Markets and set shipping zones/rates, taxes and duties. Check Prodigi product availability and shipping cost for those destinations. Publish shipping, refund, privacy and terms policies in Shopify. Retail prices below exclude delivery.
5. **Cloudflare Pages:** use `npm run build`, output **`.svelte-kit/cloudflare`**, Node **24**. This replaces the old static `build` output. Add `PUBLIC_SHOPIFY_STORE_DOMAIN` (e.g. `your-shop.myshopify.com`) and `PUBLIC_SHOPIFY_STOREFRONT_TOKEN` from `.env.example` to Pages **runtime environment variables**; use API version `2026-07`. Enable `nodejs_compat` as in `wrangler.jsonc`. Redeploy. Never use an Admin API or private Storefront token in a `PUBLIC_` variable.
6. **Accounts & email:** copy Shopify’s customer account URL into `PUBLIC_CUSTOMER_ACCOUNT_URL` if different from the default `/account`. Enable email signup/double opt-in in Shopify. Test the newsletter form’s hosted confirmation/captcha; if needed, set `PUBLIC_NEWSLETTER_URL` to a Shopify page containing a native newsletter form. Configure the Shopify-hosted pages’ “return to shop” link to this Cloudflare domain.
7. **Test, then launch:** check an international checkout, sign-in, newsletter consent, a real sample order through Prodigi and its tracking/fulfilment update in Shopify. Review colour, cropping, margins and frame quality before accepting customer orders.

Local live configuration: copy `.env.example` to `.env`, fill the same values and restart Vite. For the Cloudflare runtime, build and run `npm run preview:cloudflare` (Wrangler uses `.dev.vars` for local bindings; do not commit it).

## Provisional retail prices (GBP)

| Finish                        |  A4 |   A3 |   A2 |
| ----------------------------- | --: | ---: | ---: |
| Poster                        | £35 |  £49 |  £69 |
| Fine art print                | £49 |  £75 | £110 |
| Black / natural / white frame | £99 | £149 | £219 |

These are premium **retail proposals**, not verified cost-plus margins. Prodigi publicly lists classic frames from £16 excluding tax/shipping, but exact variant and regional costs require its dashboard. Confirm each margin using net retail revenue minus production, Shopify/payment fees, shipping subsidy, tax and a replacement reserve; allocate your monthly Shopify subscription across expected orders. Charge shipping separately initially. Sources: [Prodigi classic frames](https://www.prodigi.com/products/wall-art/framed-prints/classic-frames/), [fine art paper](https://www.prodigi.com/products/prints-and-posters/art-prints/enhanced-matte-art/), [fulfilment mapping](https://www.prodigi.com/shopify-print-on-demand-app/support/configure-your-products/).

The owner confirmed that `src/lib/assets/images/art-1.png` through `art-6.png` are the original available print files. Each is 2,360 × 1,640 pixels: approximately 198 ppi at A4, 140 ppi at A3 and 99 ppi at A2 when filling the sheet. Prodigi recommends 300 dpi for fine art and framed prints. Approve the layout and sample quality before enabling each size; larger sizes may need higher-resolution scans. Available Prodigi formats may differ by region; remove unsupported variants before publishing.

## Clothing & promotions

T-shirts are proposed at **£42**, hoodies at **£85**, plus delivery. The initial palette is desert dust / black / white for tees and ash / black / white for hoodies. The draft sizing tables use internationally available blanks: [Stanley/Stella Creator 2.0](https://www.prodigi.com/products/mens-clothing/t-shirts/classic/stanley-stella-creator-sttu755/) and [AWDis JH001](https://www.prodigi.com/products/mens-clothing/hoodies/pullover/awdis-jh001/). Confirm fit, colour names, destination coverage and exact costs in Prodigi before publication. Comfort Colors 1717 is currently US-only, so it is not a worldwide launch option.

The dummy Cosmic Shard print has a **20% sale** across its variants. The sample reduction is not exported to Shopify. Live sale badges, crossed-out prices, the sale filter and announcement use Shopify variant **Compare-at price** greater than **Price**. Set those in Shopify to run a real sale. Discount codes and automatic checkout discounts are managed in Shopify; the bag displays Shopify totals. No fake countdowns or savings are inserted into live data.

Design and copy references: [Anthropic frontend-design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) and [Corey Haines copy-editing skill](https://github.com/coreyhaines31/marketingskills/blob/main/skills/copy-editing/SKILL.md).

## Where to edit

- Live products, options, prices, availability and descriptions: **Shopify**. Additional options and catalogue pages are read automatically. GBP is the display currency; international delivery is configured at checkout, not a multi-currency switcher.
- Clothing data: `src/lib/content/clothing.json`; regenerate the editable SVG garment illustrations with `node scripts/create-clothing-mockups.mjs`. Illustrations are design concepts, not supplier photography or production files. Replace them with approved Prodigi mockups in Shopify.
- Demo prices/sizes: `src/lib/content/print-options.json`; demo artwork descriptions: `src/lib/art.ts`.
- Artist index: `src/routes/+page.svelte`; social/contact destinations: `src/lib/content/site.ts`.
- Shop copy/contact/FAQ: `src/lib/content/shop.ts`. About editorial layout: `src/routes/about/+page.svelte`.
- Shop theme: `src/routes/shop.css`; original shared palette: `src/routes/layout.css`.
- Commerce API/data types: `src/lib/commerce/`. Per-visitor cart/wishlist state is created in the root layout, not a server singleton. Only a public Storefront token reaches the browser.
- Murals: `src/routes/murals/+page.svelte` and `src/lib/content/murals.ts` (content unchanged).

Cart mutations use Shopify’s Storefront API and redirect to its returned checkout URL; the client cannot set live prices. Accounts use Shopify-hosted sign-in. Newsletter consent is posted to Shopify’s native customer form and confirmation occurs there; the site never invents a signup success. Saved pieces are browser-local. Old `/art` URLs redirect to the corresponding shop routes.

## Verify

```sh
npm run check
npm run test
npm run lint
npm run build
```

Tests cover API failures, expired carts, inventory errors, cart mutations and catalogue/variant pagination. Live payments, email delivery and Prodigi fulfilment need the account-side checks above.

Dependency note: compatible security patches have been applied. The remaining audit advisories are in the existing SvelteKit 2 cookie dependency and build/development tooling (Tailwind selector parsing and Wrangler/Miniflare image handling); a major framework/toolchain upgrade is outside this storefront rebuild. Recheck with npm audit before launch.
