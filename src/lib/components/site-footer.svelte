<script lang="ts">
	import { resolve } from '$app/paths';
	import { siteCopy, socialLinks } from '$lib/content/site';
</script>

<footer class="site-footer">
	<div class="site-footer__inner">
		<div class="footer-intro">
			<a class="footer-brand" href={resolve('/')}>{siteCopy.name}</a>
			<p>{siteCopy.footer.intro}</p>
		</div>
		<div>
			<h2>{siteCopy.footer.navigationLabel}</h2>
			<ul>
				{#each siteCopy.navigation as item (item.href)}
					<li><a href={resolve(item.href)}>{item.label}</a></li>
				{/each}
			</ul>
		</div>
		<div>
			<h2>{siteCopy.footer.contactLabel}</h2>
			<ul>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<li><a href={socialLinks.instagram.href} target="_blank" rel="noreferrer">Instagram</a></li>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<li><a href={socialLinks.facebook.href} target="_blank" rel="noreferrer">Facebook</a></li>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<li><a href={socialLinks.email.href}>Email</a></li>
			</ul>
		</div>
	</div>
	<div class="footer-base"><p>{siteCopy.footer.copyright}</p></div>
</footer>

<style>
	.site-footer {
		position: relative;
		z-index: 1;
		border-top: 1px solid var(--line);
		background: var(--navy);
		color: var(--paper);
	}

	.site-footer__inner,
	.footer-base {
		width: min(var(--content-width), calc(100% - 2rem));
		margin-inline: auto;
	}

	.site-footer__inner {
		display: grid;
		grid-template-columns: minmax(0, 2fr) repeat(2, minmax(8rem, 1fr));
		gap: 2.5rem;
		padding: 3.5rem 0 2.5rem;
	}

	.footer-intro {
		max-width: 24rem;
	}

	.footer-brand {
		color: white;
		font-family: var(--font-serif);
		font-size: 2rem;
		font-weight: 700;
		text-decoration: none;
	}

	p,
	h2,
	ul {
		margin: 0;
	}

	p,
	a {
		font-family: var(--font-sans);
	}

	p {
		margin-top: 0.65rem;
		color: color-mix(in srgb, var(--paper) 76%, transparent);
		font-size: 0.92rem;
		line-height: 1.65;
	}

	h2 {
		margin-bottom: 0.85rem;
		color: var(--sage-light);
		font-family: var(--font-sans);
		font-size: 0.72rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	ul {
		display: grid;
		gap: 0.65rem;
		padding: 0;
		list-style: none;
	}

	a {
		color: var(--paper);
		font-size: 0.9rem;
		font-weight: 600;
		text-underline-offset: 0.22rem;
	}

	.footer-base {
		border-top: 1px solid color-mix(in srgb, white 16%, transparent);
		padding: 1rem 0 1.5rem;
	}

	.footer-base p {
		margin: 0;
		font-size: 0.78rem;
	}

	@media (max-width: 640px) {
		.site-footer__inner {
			grid-template-columns: 1fr 1fr;
		}

		.footer-intro {
			grid-column: 1 / -1;
		}
	}

	@media (max-width: 420px) {
		.site-footer__inner {
			grid-template-columns: 1fr;
			gap: 2rem;
			padding-top: 3rem;
		}

		.footer-intro {
			grid-column: auto;
		}
	}
</style>
