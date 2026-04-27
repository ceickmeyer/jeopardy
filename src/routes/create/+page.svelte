<script lang="ts">
	import { enhance } from '$app/forms';

	let { form }: { form: { error?: string } | null } = $props();
	let isSubmitting = $state(false);
	let markdownText = $state('');
</script>

<svelte:head>
	<title>Create a Jeopardy Board</title>
</svelte:head>

<div class="page">
	<header>
		<a href="/">← Back</a>
		<h1>Create a Board</h1>
	</header>

	<form
		method="POST"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ update }) => {
				await update();
				isSubmitting = false;
			};
		}}
	>
		<label for="markdown">Paste your Jeopardy markdown below</label>
		<textarea
			id="markdown"
			name="markdown"
			bind:value={markdownText}
			placeholder={`# History Jeopardy\n\n## Categories\n1. **The Civil War**\n...\n\n### The Civil War\n\n**$100**\nQ: This battle marked the first major land battle of the Civil War.\nA: What is Bull Run?`}
			rows="24"
			required
		></textarea>

		{#if form?.error}
			<p class="error">{form.error}</p>
		{/if}

		<button type="submit" disabled={isSubmitting || !markdownText.trim()}>
			{isSubmitting ? 'Generating…' : 'Generate Board'}
		</button>
	</form>
</div>

<style>
	.page {
		max-width: 820px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
		min-height: 100vh;
	}

	header {
		display: flex;
		align-items: center;
		gap: 2rem;
		margin-bottom: 1.75rem;
	}

	header a {
		color: var(--gold);
		text-decoration: none;
		font-size: 1rem;
		letter-spacing: 1px;
		opacity: 0.85;
	}

	header a:hover {
		opacity: 1;
	}

	h1 {
		font-size: 2rem;
		color: var(--gold);
		text-transform: uppercase;
		letter-spacing: 3px;
		font-weight: 700;
	}

	label {
		display: block;
		margin-bottom: 0.6rem;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 2px;
		color: rgba(255, 255, 255, 0.65);
	}

	textarea {
		width: 100%;
		background: var(--blue-dark);
		color: white;
		border: 2px solid var(--border);
		padding: 1rem;
		font-family: 'Courier New', monospace;
		font-size: 0.8rem;
		line-height: 1.6;
		resize: vertical;
		outline: none;
		transition: border-color 0.15s;
	}

	textarea:focus {
		border-color: var(--gold);
	}

	textarea::placeholder {
		color: rgba(255, 255, 255, 0.25);
	}

	.error {
		color: #ff6b6b;
		margin-top: 0.75rem;
		font-size: 0.9rem;
		letter-spacing: 1px;
	}

	button {
		display: block;
		width: 100%;
		margin-top: 1rem;
		padding: 1.1rem;
		background: var(--gold);
		color: #000;
		font-family: 'Korinna', 'ITC Korinna', serif;
		font-size: 1.4rem;
		font-weight: 700;
		letter-spacing: 3px;
		text-transform: uppercase;
		border: none;
		cursor: pointer;
		transition: background 0.15s;
	}

	button:hover:not(:disabled) {
		background: #ffaa00;
	}

	button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
</style>
