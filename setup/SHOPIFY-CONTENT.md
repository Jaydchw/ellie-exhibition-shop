# Managing Ellie's website

Shopify holds the shop content. The Svelte code controls its design. Changes appear on the next page load; an already open page may need refreshing.

## One-time setup — still required in Shopify

The site integration and setup command are implemented locally. The dashboard resources, shipping and sales-channel permissions must be configured and checked before launch. A public Storefront token can read content but cannot perform this setup.

Run `npm run shopify:setup` to print the offline plan. It makes no requests or changes. With an operator's **server-only** `SHOPIFY_ADMIN_ACCESS_TOKEN` available in the process environment, run `npm run shopify:setup -- --apply` to create missing resources. The command loads the existing `.env` for the store domain/version; never put an Admin token in a `PUBLIC_` variable, browser code, a committed file, or Cloudflare's public environment. It needs Admin scopes `write_metaobject_definitions`, `write_metaobjects`, `write_products`, and `write_online_store_navigation`, with their associated read access.

The command is create-only. It preserves existing entries, collections and menus, and stops if an existing field definition is incompatible. It does not publish resources or change products, inventory, shipping, fulfilment, orders or payments. After a partial failure, fix the reported issue and run it again.

In the **Headless** sales channel, allow the public Storefront token to read products/collections (`unauthenticated_read_product_listings`), product tags (`unauthenticated_read_product_tags`), inventory (`unauthenticated_read_product_inventory`), content/menus (`unauthenticated_read_content`) and metaobjects (`unauthenticated_read_metaobjects`). Retain the existing cart permissions (`unauthenticated_read_checkouts`, `unauthenticated_write_checkouts`). Inventory access lets the website disable quantity increases at the available stock. If that permission is missing, the catalogue remains available, but Shopify must enforce stock during cart updates and checkout. The website content and artwork field definitions need **Storefront: public read**. Review these scopes in Shopify rather than changing the public token blindly.

Publish approved products **and their collections** to the Headless storefront. Keep unfinished products draft. The setup command deliberately leaves publication unchanged. No original paintings, prices, stock or photography are invented.

## Checkout opens a newsletter/password page

That page belongs to Shopify's hosted store. The app uses Shopify's Cart API and opens the exact checkout URL Shopify returns, refreshing it immediately before checkout. A working catalogue on this website does not mean the hosted checkout is public.

In **Online Store**, check the access menu: choose **Public** and **Update**, or **Launch store** the first time. On dashboards using the older layout, go to **Online Store > Preferences > Password protection** and remove the restriction. Shopify can require a selected plan, business address or other launch steps first. Check the result in a private browser window by adding an available item on this website and opening checkout; stop before paying.

Shopify's prompts to design a theme concern its separate Online Store channel. This custom Svelte website uses **Headless**, so Ellie can manage products, collections and content in Shopify without rebuilding the storefront in the theme editor. Keep Shopify's payment, business, shipping and checkout setup complete. Configure the Headless storefront's website and return links to the public website. Do not point the main domain away from this app just to satisfy a theme-design prompt.

## Add a category to the menu

1. In **Products → Collections**, create a collection, add its products and optionally its image/description. Set the display order there; manual ordering is supported.
2. Make the collection and the products in it available to the **Headless** channel.
3. In **Content → Menus → Main menu**, add a link, choose **Collections**, select the collection and save. Drag links to reorder them; nest links to make dropdowns.

That is all: the linked collection gets its own page and appears in the website navigation. Collection links in the main menu also supply the shop's category links. Labels and order come from the menu. Use collection links rather than pasting Shopify admin URLs.

The website reads menu handles **`main-menu`** and **`footer`**. Keep these handles; their titles and link labels can change. Existing menus are never replaced by the setup command, so add **Prints** and **Originals** yourself if those links are absent. For site pages, use `/about`, `/help`, `/murals` or `/shop` as the path in a custom link on the store domain. Standard Shopify page links are supported too.

The initial collections use product **type**, not Shopify's separate taxonomy category:

| Collection | Handle      | Automatic condition                     |
| ---------- | ----------- | --------------------------------------- |
| Prints     | `prints`    | Product type equals `Art print`         |
| Originals  | `originals` | Product type equals `Original painting` |

You can use other manual or automatic collections for future categories. Give them a menu link to show them on the website.

## Add an original painting

1. In **Products**, add a product with the title, description, real photographs and fixed selling price. Set **Type** to **`Original painting`**. A single painting needs only the default variant.
2. Enable **Track quantity**, set stock to **1** at Ellie's fulfilment location, and leave **Continue selling when out of stock** off. Use manual fulfilment at that location; do not map this product to Prodigi.
3. Optionally fill in the product's **Artwork medium**, **Artwork dimensions**, **Artwork year** and **Artwork framing** fields. Include units in dimensions, such as `40 × 50 cm`.
4. Add the painting to the appropriate shipping profile, then activate and publish it to Headless when it is ready to sell.

Originals appear in **Shop all** and their collection. Purchase controls allow one of each original; Shopify inventory is the final protection against two customers buying the same piece. Keep the product active, published and in its collection when it sells. At zero stock it stays visible, marked **Sold**. Archiving or unpublishing it removes it from the gallery.

Use **Type: Original painting** consistently for the automatic Originals collection: its rule is an exact match. Prints use **Art print**. If an existing Originals collection was created with the old condition `Original`, change that condition to `Original painting`; the create-only setup command reports the mismatch and preserves the merchant's existing collection. A stock limit of one restricts quantity; it does not identify a product as an original. Original products should not have the Size/Finish variants used for print reproductions. Create a separate print product when selling reproductions of a painting.

## Policies, cookie banner and data sharing

Edit legal text in **Settings > Policies**. The website's `/policies` index and individual privacy, refund, shipping and terms pages read that text from Shopify, preserving safe headings, lists and links. Unpublished/blank policies are not invented or listed as published. Shopify menu links to those policies stay within this website.

In **Settings > Customer privacy**, publish the privacy policy, enable the **Cookie banner** in the regions you serve, and review its wording, colors, preferences and placement. The website loads Shopify's native banner; Shopify decides whether to display it for the visitor. The footer's **Cookie preferences** button reopens its preferences. Consent is stored through Shopify's current Customer Privacy API and a same-origin proxy, rather than an independent checkbox or browser-storage flag. The banner requires Shopify's CDN and the proxy endpoints to be reachable. If loading fails, the footer action reports that failure and retries.

Use **Settings > Customer privacy > Data sharing opt-out page** to review applicable regions and **Shopify Network Intelligence** settings. The website's **Your privacy choices** control is a separate, visitor-initiated flow that saves only Shopify's `sale_of_data` choice and reads back its effective permission. It does not opt visitors into analytics or email marketing. Shopify's configured Global Privacy Control handling remains in force. Native banner copy/settings come from Shopify; the small site's action labels and toasts are part of this app's interface.

Privacy updates show a success notification after Shopify reports a saved choice. Failed changes remain errors. This integration does not install analytics or advertising pixels. Any future custom tracker must check Shopify's allowed-processing methods before loading or sending data; the cookie banner alone does not block arbitrary custom scripts. Account and newsletter consent remain separate from cookies and advertising preferences.

The current native SDK uses `/__shopify/api/unstable/graphql.json`; the website also supports its configured stable API version and `/api/...` alias. Deploy these server routes together with the frontend. Both proxy paths forward only Shopify cookies, keep account sessions private, honor browser privacy signals and use `no-store`. Browser cart calls use the same proxy so the refreshed checkout URL carries the current Shopify consent session. Check cookie persistence and checkout on the real domain before launch; these live checks could not be completed from the current environment.

## Customer accounts in this website

`/account` is the website's own account area for profile, delivery address and order history. It connects to Shopify's **Customer Account API**, which is separate from the Storefront API used for products and carts. Shopify hosts the secure email-code sign-in/registration step; successful sign-in returns to this website. There is no independent password database.

In **Headless > your storefront > Customer Account API**, configure a client for this application and copy its client ID. Enable Shopify's current customer accounts. Configure the exact allowed callback and logout URLs for each environment:

| Purpose          | Production URL                             | Local development URL                    |
| ---------------- | ------------------------------------------ | ---------------------------------------- |
| Sign-in callback | `https://ellieseal.co.uk/account/callback` | `http://localhost:5173/account/callback` |
| Logout return    | `https://ellieseal.co.uk/account`          | `http://localhost:5173/account`          |

Set these **server-only** environment variables in local `.env` and the Cloudflare runtime:

- `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`: the Customer Account API client ID.
- `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET`: required only for a confidential client; otherwise use a public client with PKCE.
- `CUSTOMER_ACCOUNT_SESSION_SECRET`: a long random secret of at least 32 characters used to encrypt account sessions. For example, generate one locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` and store the output privately.
- `SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN`: optional hostname override for Shopify's discovery endpoints, such as a configured `account.example.com` domain.

Never add `PUBLIC_` to the secret names or commit their values. OAuth uses state, nonce, PKCE and signed ID-token verification. Access/refresh tokens stay in encrypted HttpOnly cookies scoped to `/account`; they are not returned to the browser's JavaScript. Missing settings keep sign-in disabled instead of redirecting visitors to an unrelated Shopify storefront. The legacy `PUBLIC_CUSTOMER_ACCOUNT_URL` no longer controls this account page.

The connection credentials are not present in the current environment, so live sign-in, account changes and logout still need checking after configuration. Use a real test customer to verify a new sign-in, returning sign-in, name/address changes, order pagination and logout; do not place a paid order for this check.

## Contact and image layout

Create/edit **Online Store > Pages > Contact** with handle **`contact`** to manage the Contact page's heading, introduction and SEO. `/contact` always includes Ellie's existing email and Instagram, plus order/mural enquiry links, even when the Shopify page body is blank. Existing `/pages/contact` links redirect to `/contact`. The footer also links there and credits Jayden Holdsworth at `jaydchw.com`.

Images use fixed responsive frames in the shop, collections, homepage and About page. Product cards have a separate enlarge control, and primary images open a full-image viewer without changing the surrounding layout. Shopify continues to manage the actual uploaded images and alternative text.

## Verify Prodigi print fulfilment

Shopify manages the sale; Prodigi's Shopify integration supplies the print fulfilment. There is no Prodigi API key or second order-submission path in this website. An enabled product toggle alone does not prove all variants are ready.

The last saved account observations, dated **13 October 2026**, record 22 of 60 print variant placements completed. The **24 October 2026** review could not reach the signed-in accounts, so the table below is historical evidence, not a current dashboard verification. See `setup/fulfilment-status.json` for individual variant notes.

| Print                            | Saved completed variants | Remaining to verify/configure |
| -------------------------------- | -----------------------: | ----------------------------: |
| It feels like a cosmic shard     |                       10 |                             0 |
| It feels like love is the key    |                       10 |                             0 |
| It feels like good and evil      |                        2 |                             8 |
| Feels like a whirl pool          |                        0 |                            10 |
| It feels like it is consuming me |                        0 |                            10 |
| It feels like a ball of light    |                        0 |                            10 |

In **Prodigi > Sales channels > Shopify > Seal Stuff**, open each print and verify every A4/A3 variant against its Shopify variant/SKU. Check the supplier product, actual size, frame colour, correct artwork file, crop/orientation, border, shipping service and automatic-fulfilment setting. The intended supplier families are `GLOBAL-BLP` for Poster, `GLOBAL-FAP` for Fine art print and `GLOBAL-CFP` for framed finishes. `SEAL-*` SKUs identify Shopify variants; they are not supplier product codes. Leave original paintings outside Prodigi fulfilment.

The saved files were rated **Acceptable at A4** and **Poor at A3** by Prodigi. Review the current image quality and crop before approving those sizes. Confirm billing, Markets and delivery rates separately. A checkout-only check verifies the buying flow; it does not prove printing, delivery or tracking. A later explicitly approved sample order is needed to verify that complete chain. Do not place an order or payment as part of these read-only checks.

## Delivery and collection for originals

In **Settings → Shipping and delivery**, create an **Originals** shipping profile separate from Prodigi products, assigned to Ellie's own fulfilment location. Add UK and any supported international shipping zones with rates that cover the painting's packed weight, dimensions, packaging and insurance. Enable the destination countries in **Markets** too. Availability at checkout depends on both settings; the website does not promise every destination.

Enable **Pickup in store/local pickup** at the location holding the painting if Ellie offers collection. Check what address Shopify displays to buyers. Verify pickup appears for an eligible original; a basket containing Prodigi prints can have different delivery constraints. A mixed print/original order may be split into shipments with separate rates. Test a UK original, an international original, a collection order and a mixed basket before accepting orders. Prodigi mapping, payments and policy checks remain part of the launch checklist in the README.

## Homepage, shop introduction and About

Open **Content → Metaobjects → Website content → Website content**. Keep its handle **`main`**. Edit the Homepage, Shop and About fields and save. Image fields open Shopify's file picker; upload/select an image and add meaningful alternative text to the file. About paragraphs are separated by a blank line.

The entry's technical type is **`storefront_content`**. Its fields are:

| Area        | Field keys                                 |
| ----------- | ------------------------------------------ |
| Entry label | `title`                                    |
| Homepage    | `home_title`, `home_text`, `home_image`    |
| Shop        | `shop_title`, `shop_text`, `shop_image`    |
| About       | `about_title`, `about_text`, `about_image` |
| Help        | `faqs` (ordered list of FAQ entries)       |

Images are optional; the existing portrait remains available as a fallback. Text is displayed safely as text rather than executable HTML. Collection titles, images and descriptions are edited on their own collection pages in Shopify.

## FAQs

In **Content → Metaobjects → Website FAQ**, add or edit a question and answer. Then open the **Website content** entry and select it in **FAQs**. Drag selected entries into the order you want. Remove an entry from that list to stop showing it without deleting it. The FAQ type is **`storefront_faq`**, with fields **`question`** and **`answer`**.

Artwork field keys are **`artwork.medium`**, **`artwork.dimensions`**, **`artwork.year`** and **`artwork.framing`**. Their definitions live in **Settings → Metafields and metaobjects → Products**.

The optional **Care instructions** product field is **`artwork.care_instructions`**: a multi-line text field with **Storefront: public read**. It applies to this product and overrides the website's product-type default. Rerun the setup command with the documented server-only credential to add a missing definition; existing merchant values are preserved.

## References

- [Shopify collections and menu links](https://help.shopify.com/en/manual/products/collections/make-collections-findable)
- [Shopify custom data and metaobjects](https://help.shopify.com/en/manual/custom-data/metaobjects)
- [Shopify API access scopes](https://shopify.dev/docs/api/usage/access-scopes)
- [Metaobject definitions API](https://shopify.dev/docs/api/admin-graphql/2026-07/mutations/metaobjectDefinitionCreate)
- [Field validations](https://shopify.dev/docs/apps/build/metafields/list-of-validation-options)
- [Shopify hosted-store access and password page](https://help.shopify.com/en/manual/online-store/themes/password-page)
- [Shopify Headless overview](https://shopify.dev/docs/storefronts/headless/overview)
- [Configuring Prodigi products and variants](https://www.prodigi.com/shopify-print-on-demand-app/support/configure-your-products/)
