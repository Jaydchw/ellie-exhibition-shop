<script lang="ts">
	import type { ChatMessage } from '$lib/content/murals';

	let { messages }: { messages: ChatMessage[] } = $props();
</script>

<div class="chat" aria-label="Example mural enquiry conversation">
	<p class="chat-date">Example conversation</p>
	{#each messages as message, index (`${message.sender}-${index}`)}
		{@const isContinued = messages[index - 1]?.sender === message.sender}
		<article
			class:message--ellie={message.sender === 'ellie'}
			class:message--continued={isContinued}
			class="message"
		>
			{#if !isContinued}
				<span class="sender">{message.sender === 'ellie' ? 'Ellie' : 'Client'}</span>
			{/if}
			<div class="bubble">
				{#if !message.mediaFirst}<p>{message.text}</p>{/if}
				{#if message.media}
					<figure>
						<img src={message.media.image} alt={message.media.alt} loading="lazy" />
					</figure>
				{/if}
				{#if message.mediaFirst}<p>{message.text}</p>{/if}
			</div>
		</article>
	{/each}
</div>

<style>
	.chat {
		display: grid;
		gap: 0.55rem;
		max-width: 48rem;
		margin-inline: auto;
		padding: 1rem 0;
	}

	.chat-date {
		margin: 0 0 1.5rem;
		color: var(--muted);
		font-family: var(--font-sans);
		font-size: 0.72rem;
		font-weight: 750;
		letter-spacing: 0.09em;
		text-align: center;
		text-transform: uppercase;
	}

	.message {
		display: grid;
		justify-items: start;
		width: min(84%, 36rem);
	}

	.message:not(.message--continued) {
		margin-top: 2rem;
	}

	.chat-date + .message {
		margin-top: 0;
	}

	.message--ellie {
		justify-self: end;
		justify-items: end;
	}

	.sender {
		margin: 0 0 0.4rem 0.8rem;
		color: var(--muted);
		font-family: var(--font-sans);
		font-size: 0.68rem;
		font-weight: 750;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.message--ellie .sender {
		margin-right: 0.8rem;
	}

	.bubble {
		width: 100%;
		border-radius: 1.4rem 1.4rem 1.4rem 0.25rem;
		background: #e8e3da;
		color: var(--ink);
		font-family: var(--font-sans);
		padding: clamp(1rem, 3vw, 1.35rem);
	}

	.message--ellie .bubble {
		border-radius: 1.4rem 1.4rem 0.25rem 1.4rem;
		background: var(--navy);
		color: white;
	}

	.message--continued:not(.message--ellie) .bubble {
		border-top-left-radius: 0.4rem;
	}

	.message--continued.message--ellie .bubble {
		border-top-right-radius: 0.4rem;
	}

	.bubble > p {
		margin: 0;
		font-size: clamp(0.98rem, 2vw, 1.08rem);
		line-height: 1.6;
	}

	figure {
		margin: 1rem 0 0;
		overflow: hidden;
		border-radius: 0.85rem;
		background: var(--paper);
	}

	figure:first-child {
		margin-top: 0;
		margin-bottom: 1rem;
	}

	figure img {
		display: block;
		height: auto;
		max-height: 36rem;
		width: 100%;
		object-fit: contain;
	}

	@media (max-width: 620px) {
		.chat {
			gap: 0.45rem;
		}
		.message {
			width: 92%;
		}
		.bubble {
			border-radius: 1rem 1rem 1rem 0.2rem;
		}
		.message--ellie .bubble {
			border-radius: 1rem 1rem 0.2rem 1rem;
		}
	}
</style>
