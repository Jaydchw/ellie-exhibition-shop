# Search setup and checks

The website renders its content and search metadata on the server. The shop is open by default; there is no construction flag or environment switch.

## Public domain

The canonical origin defaults to **https://ellieseal.co.uk**, which is linked by [Culture Hull's feature on Ellie](https://www.culturehull.com/blog/post/young-hull-artist-launches-creative-mural-business/). Set `PUBLIC_SITE_URL` in the Cloudflare runtime environment if the public domain changes. Use an HTTPS origin, without credentials, a path or query parameters.

Only requests on that exact production origin are indexable. Localhost, branch previews and other hosts serve `noindex` metadata and an `X-Robots-Tag` header while keeping the site usable for review. HTTP and www aliases of the public domain receive a permanent redirect to the chosen HTTPS origin. Configure the public domain and TLS in Cloudflare; this code cannot attach or verify a domain in the hosting account.

## What search engines receive

| URL or page                     | Behaviour                                                                                                                                 |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/robots.txt`                   | Public assets and pages may be crawled; advertises the canonical sitemap URL.                                                             |
| `/sitemap.xml`                  | Sitemap index linking the two root-level child sitemaps.                                                                                  |
| `/sitemap-pages.xml`            | Home, About, Help, Murals and Hull mural service page.                                                                                    |
| `/sitemap-shop.xml`             | Published products, nonempty collections and additional published Shopify Pages; actual modification times and product/collection images. |
| Product variants                | Each `?variant=` link selects its variant in server-rendered HTML; canonical points to the parent product.                                |
| Search, sort and filter URLs    | `noindex, follow`, with the unfiltered page as canonical.                                                                                 |
| Account and saved pieces        | `noindex, follow`; omitted from sitemaps.                                                                                                 |
| Empty shop or collection        | `noindex`; omitted from shop sitemap.                                                                                                     |
| Missing page/product/collection | HTTP 404 and `noindex`.                                                                                                                   |
| Temporary shop/API failure      | HTTP 503, `Retry-After` and no-store; a failed shop sitemap does not replace the catalogue with a successful partial file.                |

Robots does not block the pages with `noindex`: crawlers need access to see that directive. Public CSS, JavaScript and images remain crawlable. No meta-keyword lists, fake ratings, invented business addresses, fake last-modified dates or repetitive city pages are added.

Page metadata includes a unique title/description, one canonical, Open Graph and Twitter previews. Products use actual Shopify prices, currency, availability and SKU when present. Multi-variant products use `ProductGroup` and variant `Product`/`Offer` entries; single originals use `Product`/`Offer`. Listing pages use `CollectionPage`/`ItemList`, rather than pretending the whole catalogue is one purchasable product. Breadcrumbs describe the actual page hierarchy. Identity markup describes Ellie, Seal Stuff and the website using existing public information.

## Editing SEO in Shopify

On a product, collection or Shopify Page, open **Search engine listing > Edit** to set its SEO title and description. Those values override the site's sensible fallbacks. A product or collection must be published to the Headless channel to appear on the site. Original paintings remain in search and the gallery after selling when kept active and published.

The homepage and About metadata use their Website content text and images. Keep image alternative text descriptive in Shopify Files and product media. Use actual artwork names, materials and dimensions in listings rather than repeating search keywords.

## Hull page

`/murals/hull` is a self-canonical service page for a Hull mural enquiry. It reuses the real work, style examples and commission flow, with distinct local service copy, quote inputs and practical wall/preparation questions. Both mural pages link to each other, and the Hull page links to the genuine Culture Hull coverage. Existing project photographs are not relabelled as Hull commissions.

`Service` markup states the real service area. No public studio address, opening hours, star ratings or local-business rich-result eligibility is invented. Avoid cloning this page into many town-name variants; add another area page only when it has useful, distinct information and the service is actually offered there.

## After deployment

1. Check the public homepage, `/murals/hull`, one product/variant and both child sitemaps on the real domain. Confirm their canonical/robots tags in the initial HTML. A branch preview should remain `noindex`.
2. Verify the domain in **Google Search Console**, submit `https://ellieseal.co.uk/sitemap.xml`, and inspect the Hull and product URLs. Use the Rich Results Test on a published product. These are owner-account actions, not completed by a local build.
3. Review Google's indexing and sitemap reports after recrawling. A missing or failed Shopify content permission needs correcting in the Headless token settings; a successful build does not verify live permissions.
4. For map/local results, maintain an eligible **Google Business Profile** with the real business name, correct service category, Hull service area and real project photographs. If customers are not served at the business address, use a service-area profile and hide that address. Ask actual clients for honest reviews; do not invent reviews or keyword-stuff the business name.

Search visibility also depends on useful work, relevant links, location and reputation. The code provides crawlable pages and accurate signals; Search Console and Business Profile account setup remain separate tasks.

## Research

- [Google: JavaScript SEO and server rendering](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: sitemap construction and submission](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: ecommerce URL structure](https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites)
- [Google: product variants](https://developers.google.com/search/docs/appearance/structured-data/product-variants)
- [Google: structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google: doorway abuse](https://developers.google.com/search/docs/essentials/spam-policies#doorway-abuse)
- [Google: local ranking factors](https://support.google.com/business/answer/7091)
- [Google: service-area businesses](https://support.google.com/business/answer/9157481)
