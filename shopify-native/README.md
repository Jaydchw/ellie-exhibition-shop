# Editing the Shopify shop locally

`store-theme/` is the complete theme downloaded from **Seal Stuff — artist shop**, Shopify theme **212416823687**, on 25 October 2026. It contains 487 files, including the prepared cream, navy and sage design. This is the working copy for further Shopify design changes.

The artist website remains in the existing Svelte project. `theme/` preserves the earlier 14-file customization layer, and `backup-horizon-2026-10-24/` preserves the earlier sparse backup. Those directories are not complete standalone themes.

## Where to edit

| Folder or file                                    | Purpose                                            |
| ------------------------------------------------- | -------------------------------------------------- |
| `store-theme/assets/seal-stuff.css`               | The custom shop styling                            |
| `store-theme/sections/seal-shop-intro.liquid`     | Shop introduction and heading                      |
| `store-theme/sections/seal-featured-art.liquid`   | Featured artwork presentation                      |
| `store-theme/sections/` and `store-theme/blocks/` | Header, footer and reusable theme components       |
| `store-theme/templates/`                          | Homepage, collections, product and contact layouts |
| `store-theme/config/`                             | Theme options and saved design settings            |

Products, prices, stock, orders, accounts, policies, fulfilment and domains remain Shopify settings. They are not downloaded as theme files. Liquid renders through Shopify; this theme is not a separate Svelte application and does not run fully offline.

Shopify adds generated comments and expands some JSON settings when returning files. Keep those comments and the returned settings intact. JSON templates and settings may be updated by the Shopify theme editor; retrieve the latest remote version before changing a file that someone has edited online.

## Uploading changes

The connected Shopify tools can upload individual edited files from this folder to the prepared theme. This route works without installing Shopify CLI or accessing the browser editor. Only send files intentionally changed, and check Shopify's returned errors and file readback. Never upload the old sparse directories as complete replacement themes.

Uploading files updates the target theme. Publishing selects which theme shoppers see. The downloaded theme is still unpublished; this download has not changed the live shop or the artist website. The current connector requires publication through Shopify admin. Do not replace the live Horizon theme's files to bypass that restriction.

## Optional Shopify CLI workflow

Shopify's supported local workflow uses [Shopify CLI for themes](https://shopify.dev/docs/storefronts/themes/tools/cli). The CLI is not installed in this project. Run the following in your own terminal from the repository root if you want local preview and command-line uploads:

```powershell
npm install -g @shopify/cli
shopify theme dev --store pr8fqg-6y.myshopify.com --path shopify-native/store-theme
```

The first store command opens Shopify authentication. Sign in using the account that can manage Seal Stuff. `theme dev` uploads a separate development preview and reloads it as files change; it does not publish the prepared theme.

Check the theme locally with:

```powershell
shopify theme check --path shopify-native/store-theme
```

To upload to the existing prepared theme while preserving remote files:

```powershell
shopify theme push --store pr8fqg-6y.myshopify.com --theme 212416823687 --path shopify-native/store-theme --nodelete
```

Do not run a full push if someone has edited the theme online since this download. Compare or pull those remote changes into a separate directory first, then merge. For selective updates, [`theme push --only`](https://shopify.dev/docs/api/shopify-cli/theme/theme-push) can limit the upload to specific files. The command above has not been executed here: the current command environment cannot resolve Shopify or npm.

## Current launch state

The existing `/shop` handoff is already deployed. The prepared theme still needs publication and the originals templates need assignment. A branded `shop.ellieseal.co.uk` domain still needs Shopify/DNS configuration; keep the apex and `www` on the artist website. Prodigi remains unchanged.
