import { mkdir, writeFile, appendFile } from 'node:fs/promises';
import path from 'node:path';

const shopOrigin = 'https://pr8fqg-6y.myshopify.com';
const artistOrigin = 'https://ellieseal.co.uk';
const expectedThemeId = process.env.SMOKE_EXPECTED_THEME_ID || '212416823687';
const output = path.resolve('native-shop-report');
const report = {
	startedAt: new Date().toISOString(),
	commit: process.env.GITHUB_SHA || null,
	deployment: process.env.SMOKE_DEPLOYMENT_STATUS || 'not_run',
	shopOrigin,
	artistOrigin,
	expectedThemeId,
	ordersPlaced: false,
	checkoutSubmitted: false,
	emailsSent: false,
	prodigiAccessed: false,
	checks: [],
	pages: [],
	screenshots: [],
	blockedProdigiRequests: 0
};
let browser;
await mkdir(output, { recursive: true });

function check(name, passed, details = {}) {
	const result = { name, passed: !!passed, ...details };
	report.checks.push(result);
	console.log(`${passed ? 'PASS' : 'FAIL'} ${name}: ${JSON.stringify(details)}`);
	return !!passed;
}

function locationSummary(value) {
	const url = new URL(value);
	return url.origin + url.pathname;
}

async function makeContext(viewport) {
	const context = await browser.newContext({ viewport, locale: 'en-GB' });
	await context.route('**/*', async (route) => {
		const hostname = new URL(route.request().url()).hostname;
		if (hostname === 'prodigi.com' || hostname.endsWith('.prodigi.com')) {
			report.blockedProdigiRequests++;
			await route.abort();
		} else {
			await route.continue();
		}
	});
	context.setDefaultTimeout(15000);
	context.setDefaultNavigationTimeout(45000);
	return context;
}

function nativeUrl(route, preview) {
	const url = new URL(route, shopOrigin);
	if (preview) {
		url.searchParams.set('preview_theme_id', expectedThemeId);
		if (route === '/collections/originals') url.searchParams.set('view', 'originals');
		if (route === '/products/oil-painting-looking-up-and-forwards')
			url.searchParams.set('view', 'original');
	}
	return url.href;
}

async function settlePage(page) {
	await page.evaluate(async () => {
		await Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 5000))]);
		window.scrollTo(0, document.body.scrollHeight);
	});
	await page
		.waitForFunction(
			() =>
				[...document.images]
					.filter((image) => {
						const box = image.getBoundingClientRect();
						return box.width > 80 && box.height > 80 && image.loading !== 'lazy';
					})
					.every((image) => image.complete),
			null,
			{ timeout: 10000 }
		)
		.catch(() => {});
	await page.evaluate(async () => {
		window.scrollTo(0, 0);
		await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
	});
}

async function screenshot(page, name) {
	const filename = `${name}.png`;
	await page.screenshot({ path: path.join(output, filename), fullPage: true });
	report.screenshots.push(filename);
}

async function inspectNativePage(context, viewportName, route, preview) {
	const page = await context.newPage();
	const key = `${preview ? 'draft' : 'live'}-${viewportName}-${route.replaceAll('/', '-').replace(/^-/, '') || 'home'}`;
	try {
		const response = await page.goto(nativeUrl(route, preview), { waitUntil: 'domcontentloaded' });
		await settlePage(page);
		const metrics = await page.evaluate(() => {
			const artworks = [...document.images].flatMap((image) => {
				const box = image.getBoundingClientRect();
				if (box.width < 80 || box.height < 80) return [];
				const style = getComputedStyle(image);
				const width = box.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
				const height = box.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
				const naturalRatio = image.naturalWidth / image.naturalHeight;
				const renderedRatio = width / height;
				const distorted =
					image.naturalWidth > 0 &&
					style.objectFit === 'fill' &&
					Math.abs(renderedRatio / naturalRatio - 1) > 0.03;
				return [
					{
						alt: image.alt,
						loaded: image.complete && image.naturalWidth > 0,
						broken: image.complete && image.naturalWidth === 0,
						distorted
					}
				];
			});
			return {
				themeId: String(window.Shopify?.theme?.id || ''),
				title: document.title,
				headings: [...document.querySelectorAll('h1')].map((heading) => heading.textContent.trim()),
				horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
				artworks,
				links: [...document.querySelectorAll('a[href]')].map((anchor) => ({
					text: anchor.textContent.replace(/\s+/g, ' ').trim(),
					href: anchor.href,
					label: anchor.getAttribute('aria-label') || ''
				}))
			};
		});
		const healthy = response?.ok() && !new URL(page.url()).pathname.startsWith('/password');
		check(`${key}:page`, healthy, {
			status: response?.status(),
			location: locationSummary(page.url())
		});
		check(`${key}:overflow`, metrics.horizontalOverflow <= 2, {
			pixels: metrics.horizontalOverflow
		});
		check(`${key}:images`, !metrics.artworks.some((image) => image.distorted || image.broken), {
			artworkCount: metrics.artworks.length,
			problems: metrics.artworks.filter((image) => image.distorted || image.broken)
		});
		if (route === '/') {
			check(
				`${key}:credit`,
				metrics.links.some(
					(link) =>
						link.href.replace(/\/$/, '') === 'https://jaydchw.com' &&
						link.text.includes('Created by Jayden Holdsworth')
				)
			);
			for (const destination of ['/collections/prints', '/collections/originals']) {
				check(
					`${key}:navigation:${destination}`,
					metrics.links.some((link) => new URL(link.href).pathname === destination)
				);
			}
			check(
				`${key}:artist-link`,
				metrics.links.some((link) => link.href.replace(/\/$/, '') === artistOrigin)
			);
			check(
				`${key}:murals-link`,
				metrics.links.some((link) => link.href === `${artistOrigin}/murals`)
			);
			check(
				`${key}:account-link`,
				metrics.links.some((link) =>
					/account|customer_authentication/.test(new URL(link.href).pathname)
				)
			);
		}
		if (route.startsWith('/products/')) {
			check(
				`${key}:native-product-form`,
				(await page.locator('form[action*="/cart/add"]').count()) > 0
			);
		}
		if (route === '/products/oil-painting-looking-up-and-forwards') {
			const labels = await page.locator('label').allTextContents();
			const printLabels = labels.filter((label) =>
				/^(?:print\s+)?(?:size|finish)\s*:?$/i.test(label.trim())
			);
			check(`${key}:original-has-no-print-options`, printLabels.length === 0, { printLabels });
		}
		if (route === '/pages/contact') {
			check(
				`${key}:contact-email`,
				(await page.locator('a[href="mailto:ellieseal21@gmail.com"]').count()) > 0
			);
		}
		await screenshot(page, key);
		if (viewportName === 'desktop' && route === '/products/print-looking-up-and-forwards') {
			const zoomTarget = page.locator('.product-media-container--zoomable').first();
			if (await zoomTarget.isVisible().catch(() => false)) {
				report.nativeZoomObservation = { available: true, scope: preview ? 'draft' : 'live' };
				try {
					await zoomTarget.click();
					const gallery = page.locator('.dialog-zoomed-gallery').first();
					await gallery.waitFor({ state: 'visible', timeout: 5000 });
					check(`${key}:native-image-zoom`, await gallery.isVisible());
					await screenshot(page, `${key}-zoom`);
				} catch (error) {
					check(`${key}:native-image-zoom`, false, { error: error.message });
				} finally {
					await page.keyboard.press('Escape');
				}
			} else {
				report.nativeZoomObservation = {
					available: false,
					scope: preview ? 'draft' : 'live',
					reason: 'Known native zoom target was not visible; zoom behavior was not verified.'
				};
			}
		}
		report.pages.push({
			scope: preview ? 'draft' : 'live',
			viewport: viewportName,
			route,
			...metrics,
			links: undefined
		});
	} catch (error) {
		check(`${key}:inspection`, false, { error: error.message });
		await screenshot(page, `${key}-error`).catch(() => {});
	} finally {
		await page.close();
	}
}

async function inspectAccount(context) {
	const page = await context.newPage();
	try {
		const response = await page.goto(`${shopOrigin}/account`, { waitUntil: 'domcontentloaded' });
		const url = new URL(page.url());
		const shopifyHost =
			url.hostname === new URL(shopOrigin).hostname ||
			url.hostname === 'shopify.com' ||
			url.hostname.endsWith('.shopify.com');
		check(
			'native-account-entry',
			shopifyHost && url.pathname !== '/' && (response?.status() || 500) < 400,
			{
				status: response?.status(),
				location: locationSummary(page.url())
			}
		);
		await screenshot(page, 'native-account-entry');
	} catch (error) {
		check('native-account-entry', false, { error: error.message });
	} finally {
		await page.close();
	}
}

async function observeNativePrivacy(page) {
	const observation = await page.evaluate(async () => {
		let featureLoad = 'not needed';
		if (!window.Shopify?.customerPrivacy && typeof window.Shopify?.loadFeatures === 'function') {
			featureLoad = await new Promise((resolve) => {
				const timeout = setTimeout(() => resolve('timed out'), 5000);
				try {
					window.Shopify.loadFeatures(
						[{ name: 'consent-tracking-api', version: '0.1' }],
						(error) => {
							clearTimeout(timeout);
							resolve(error ? String(error.message || error) : 'loaded');
						}
					);
				} catch (error) {
					clearTimeout(timeout);
					resolve(error.message);
				}
			});
		}
		const privacy = window.Shopify?.customerPrivacy;
		const methods = {};
		for (const name of ['currentVisitorConsent', 'shouldShowBanner', 'getRegion']) {
			methods[name] = { supported: typeof privacy?.[name] === 'function' };
			if (methods[name].supported) {
				try {
					methods[name].value = privacy[name]();
				} catch (error) {
					methods[name].error = error.message;
				}
			}
		}
		const visibleBanners = [...document.querySelectorAll('#shopify-pc__banner, #shopify-pc__prefs')]
			.filter((element) => {
				const box = element.getBoundingClientRect();
				const style = getComputedStyle(element);
				return (
					box.width > 0 &&
					box.height > 0 &&
					style.visibility !== 'hidden' &&
					style.display !== 'none'
				);
			})
			.map((element) => element.textContent.replace(/\s+/g, ' ').trim().slice(0, 2000));
		const linkedPolicies = [
			...new Map(
				[...document.querySelectorAll('a[href]')]
					.filter((anchor) => new URL(anchor.href).pathname.startsWith('/policies/'))
					.map((anchor) => [
						new URL(anchor.href).pathname,
						{
							path: new URL(anchor.href).pathname,
							title: anchor.textContent.replace(/\s+/g, ' ').trim()
						}
					])
			).values()
		];
		return {
			customerPrivacyPresent: !!privacy,
			featureLoad,
			methods,
			visibleBanners,
			linkedPolicies
		};
	});
	report.nativePrivacyObservation = {
		...observation,
		consentWritten: false,
		bannerConfigurationVerified: false,
		limitation:
			'Runner geolocation can affect banner visibility. No visible banner does not prove the banner is disabled; read_privacy_settings access is required to inspect settings.'
	};
	report.nativePolicyObservation = {
		linkedPolicyCount: observation.linkedPolicies.length,
		linkedPolicies: observation.linkedPolicies,
		limitation:
			'Counts unique native policy links rendered in the live storefront. The preceding Admin audit found only a Privacy policy; the smoke script does not create or alter policy text.'
	};
	console.log(`OBSERVATION native privacy: ${JSON.stringify(report.nativePrivacyObservation)}`);
}

async function inspectCart(context, preview) {
	try {
		const productResponse = await context.request.get(
			`${shopOrigin}/products/print-looking-up-and-forwards.js`
		);
		if (!productResponse.ok()) throw new Error(`Print JSON returned ${productResponse.status()}`);
		const product = await productResponse.json();
		const variant = product.variants.find((item) => item.available);
		if (!variant) throw new Error('The existing physical print has no available variant');
		const added = await context.request.post(`${shopOrigin}/cart/add.js`, {
			data: { id: variant.id, quantity: 1 }
		});
		if (!added.ok()) throw new Error(`Add to cart returned ${added.status()}`);
		const cartResponse = await context.request.get(`${shopOrigin}/cart.js`);
		if (!cartResponse.ok()) throw new Error(`Cart JSON returned ${cartResponse.status()}`);
		const cart = await cartResponse.json();
		check(
			'native-cart-only',
			cart.items.some((item) => item.variant_id === variant.id && item.quantity === 1),
			{
				variantId: variant.id,
				itemCount: cart.item_count,
				checkoutOpened: false
			}
		);
		const page = await context.newPage();
		try {
			await page.goto(nativeUrl('/cart', preview), { waitUntil: 'domcontentloaded' });
			await settlePage(page);
			await screenshot(page, `${preview ? 'draft' : 'live'}-cart`);
		} finally {
			await page.close();
		}
	} catch (error) {
		check('native-cart-only', false, { error: error.message });
	}
}

async function inspectArtistHandoff() {
	const deadline = Date.now() + 180000;
	let last = {};
	let live = false;
	while (Date.now() < deadline) {
		try {
			const response = await fetch(`${artistOrigin}/shop`, {
				redirect: 'manual',
				headers: { 'Cache-Control': 'no-cache' },
				signal: AbortSignal.timeout(10000)
			});
			const location = response.headers.get('location');
			last = { status: response.status, location };
			if (
				response.status >= 300 &&
				response.status < 400 &&
				location &&
				new URL(location, artistOrigin).origin === shopOrigin
			) {
				live = true;
				break;
			}
		} catch (error) {
			last = { error: error.message };
		}
		await new Promise((resolve) => setTimeout(resolve, 10000));
	}
	check('artist-shop-redirect-live', live, { ...last, pending: !live, waitedUpToSeconds: 180 });
	if (!live) return;
	const context = await makeContext({ width: 1440, height: 1100 });
	try {
		const aboutResponse = await fetch(`${artistOrigin}/about`, {
			redirect: 'manual',
			signal: AbortSignal.timeout(10000)
		});
		check(
			'artist:about-redirects-home',
			aboutResponse.status === 308 &&
				new URL(aboutResponse.headers.get('location') || '/about', artistOrigin).href ===
					`${artistOrigin}/`
		);
		for (const route of ['/', '/murals', '/murals/hull']) {
			const page = await context.newPage();
			try {
				const response = await page.goto(artistOrigin + route, { waitUntil: 'domcontentloaded' });
				check(`artist:${route}`, response?.ok() && new URL(page.url()).origin === artistOrigin, {
					status: response?.status(),
					location: locationSummary(page.url())
				});
				check(
					`artist:${route}:no-custom-commerce-utilities`,
					(await page
						.locator('.bag-toggle, .saved-link, .account-shortcut, #shopify-privacy-sdk')
						.count()) === 0
				);
				check(
					`artist:${route}:no-traditional-header`,
					(await page.locator('.site-header').count()) === 0
				);
				if (route === '/') {
					const destinations = await page
						.locator('main .destinations a')
						.evaluateAll((links) =>
							links.map((link) => ({ text: link.textContent.trim(), href: link.href }))
						);
					check(
						'artist:home:three-destinations',
						destinations.length === 3 &&
							destinations.some((link) => link.href === `${artistOrigin}/murals`) &&
							destinations.some(
								(link) =>
									new URL(link.href).origin !== artistOrigin &&
									/^(?:visit\s+)?shop$/i.test(link.text)
							) &&
							destinations.some(
								(link) =>
									link.href === 'https://shop.ellieseal.co.uk/pages/contact' &&
									/^contact$/i.test(link.text)
							)
					);
				}
				const privacyLinks = await page
					.locator('footer a[href]')
					.evaluateAll((links) =>
						links
							.map((link) => ({ text: link.textContent.trim(), href: link.href }))
							.filter((link) => /privacy/i.test(link.text))
					);
				check(
					`artist:${route}:native-privacy-links`,
					privacyLinks.length >= 2 &&
						privacyLinks.every((link) => {
							const url = new URL(link.href);
							return url.protocol === 'https:' && url.origin !== artistOrigin;
						})
				);
				check(
					`artist:${route}:native-contact-link`,
					(await page
						.locator('footer a[href="https://shop.ellieseal.co.uk/pages/contact"]')
						.count()) === 1
				);
				await settlePage(page);
				await screenshot(page, `artist-${route.replaceAll('/', '-') || 'home'}`);
			} catch (error) {
				check(`artist:${route}`, false, { error: error.message });
			} finally {
				await page.close();
			}
		}
		const indexResponse = await fetch(`${artistOrigin}/sitemap.xml`, {
			signal: AbortSignal.timeout(15000)
		});
		const index = await indexResponse.text();
		check(
			'artist-only-sitemap-index',
			indexResponse.ok &&
				index.includes('/sitemap-pages.xml') &&
				!index.includes('/sitemap-shop.xml')
		);
		const legacyResponse = await fetch(`${artistOrigin}/sitemap-shop.xml`, {
			signal: AbortSignal.timeout(15000)
		});
		const legacy = await legacyResponse.text();
		check(
			'legacy-commerce-sitemap-empty',
			legacyResponse.ok && legacy.includes('<urlset') && !legacy.includes('<url>')
		);
	} finally {
		await context.close();
	}
}

try {
	const { chromium } = await import('playwright');
	browser = await chromium.launch({ headless: true });
	const publicContext = await makeContext({ width: 1440, height: 1100 });
	let publishedThemeId = '';
	try {
		const page = await publicContext.newPage();
		const response = await page.goto(shopOrigin, { waitUntil: 'domcontentloaded' });
		publishedThemeId = await page.evaluate(() => String(window.Shopify?.theme?.id || ''));
		await observeNativePrivacy(page);
		check(
			'native-public-store',
			response?.ok() && !new URL(page.url()).pathname.startsWith('/password'),
			{ status: response?.status() }
		);
		await screenshot(page, 'public-shop-home');
		await page.close();
	} finally {
		await publicContext.close();
	}
	report.publishedThemeId = publishedThemeId;
	report.themePublished = publishedThemeId === expectedThemeId;
	check('prepared-theme-is-published', report.themePublished, {
		actualThemeId: publishedThemeId,
		expectedThemeId,
		pendingManualPublication: !report.themePublished
	});
	const preview = !report.themePublished;
	report.detailedInspectionScope = preview ? 'unpublished-draft-preview' : 'published-store';
	const routes = [
		'/',
		'/collections/prints',
		'/collections/originals',
		'/products/print-looking-up-and-forwards',
		'/products/oil-painting-looking-up-and-forwards',
		'/pages/contact',
		'/policies/privacy-policy',
		'/pages/data-sharing-opt-out'
	];
	for (const [viewportName, viewport] of Object.entries({
		desktop: { width: 1440, height: 1100 },
		mobile: { width: 390, height: 844 }
	})) {
		const context = await makeContext(viewport);
		try {
			for (const route of routes) await inspectNativePage(context, viewportName, route, preview);
			if (viewportName === 'desktop') {
				await inspectAccount(context);
				await inspectCart(context, preview);
			}
		} finally {
			await context.close();
		}
	}
	await inspectArtistHandoff();
} catch (error) {
	check('smoke-runner', false, { error: error.message });
} finally {
	await browser?.close();
	report.finishedAt = new Date().toISOString();
	report.passed = report.checks.every((result) => result.passed);
	report.failedChecks = report.checks
		.filter((result) => !result.passed)
		.map((result) => result.name);
	await writeFile(path.join(output, 'summary.json'), JSON.stringify(report, null, 2) + '\n');
	const summary =
		[
			'## Native shop launch checks',
			`Commit: ${report.commit || 'local'}`,
			`Cloudflare deployment: ${report.deployment}`,
			`Prepared theme published: ${report.themePublished ? 'yes' : 'no / unverified'}`,
			`Detailed screenshots: ${report.detailedInspectionScope || 'unavailable'}`,
			`Checks: ${report.checks.filter((result) => result.passed).length}/${report.checks.length} passed`,
			`Failed/pending: ${report.failedChecks.join(', ') || 'none'}`,
			'No checkout/order/email submission or Prodigi access was performed.'
		].join('\n\n') + '\n';
	await writeFile(path.join(output, 'summary.md'), summary);
	if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
	console.log(
		JSON.stringify({
			passed: report.passed,
			failedChecks: report.failedChecks,
			themePublished: report.themePublished,
			screenshotCount: report.screenshots.length
		})
	);
	if (!report.passed) process.exitCode = 1;
}
