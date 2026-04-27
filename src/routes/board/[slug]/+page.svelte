<script lang="ts">
	import type { PageData } from './$types';
	import type { JeopardyQuestion } from '$lib/types';

	let { data }: { data: PageData } = $props();
	const board = $derived(data.board);

	const values = $derived(
		[...new Set(board.categories.flatMap((c) => c.questions.map((q) => q.value)))].sort(
			(a, b) => a - b
		)
	);

	let cellStates = $state<Record<string, 'done'>>({});

	let activeQuestion = $state<JeopardyQuestion | null>(null);
	let activeCatName = $state('');
	let activeCellKey = $state('');
	let modalStage = $state<'question' | 'answer'>('question');

	function openCell(catIdx: number, value: number) {
		const key = `${catIdx}-${value}`;
		if (cellStates[key]) return;

		const cat = board.categories[catIdx];
		const question = cat.questions.find((q) => q.value === value);
		if (!question) return;

		activeQuestion = question;
		activeCatName = cat.name;
		activeCellKey = key;
		modalStage = 'question';
	}

	function advance() {
		if (!activeQuestion) return;
		if (modalStage === 'question') {
			modalStage = 'answer';
		} else {
			cellStates[activeCellKey] = 'done';
			activeQuestion = null;
			activeCellKey = '';
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!activeQuestion) return;
		if (e.key === 'Escape') {
			cellStates[activeCellKey] = 'done';
			activeQuestion = null;
			activeCellKey = '';
		} else if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			advance();
		}
	}
</script>

<svelte:head>
	<title>{board.title} – Jeopardy</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div
	class="board"
	style:grid-template-columns="repeat({board.categories.length}, 1fr)"
	style:grid-template-rows="auto repeat({values.length}, 1fr)"
>
	{#each board.categories as cat}
		<div class="cat-header">
			<span>{cat.name}</span>
		</div>
	{/each}

	{#each values as value}
		{#each board.categories as cat, catIdx}
			{@const key = `${catIdx}-${value}`}
			{@const isDone = !!cellStates[key]}
			{@const hasQ = cat.questions.some((q) => q.value === value)}
			{#if hasQ}
				<div
					class="cell"
					class:done={isDone}
					role="button"
					tabindex="0"
					aria-disabled={isDone || undefined}
					onclick={() => openCell(catIdx, value)}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && openCell(catIdx, value)}
				>
					{#if !isDone}
						<span class="amount">${value}</span>
					{/if}
				</div>
			{:else}
				<div class="cell empty"></div>
			{/if}
		{/each}
	{/each}
</div>

{#if activeQuestion}
	<button class="overlay" onclick={advance} aria-label={modalStage === 'question' ? 'Reveal answer' : 'Close'}>
		<div class="modal">
			<p class="modal-category">{activeCatName}</p>
			<p class="modal-value">${activeQuestion.value}</p>

			{#if modalStage === 'question'}
				<p class="modal-clue">{activeQuestion.question}</p>
				<p class="modal-hint">click to reveal answer</p>
			{:else}
				<p class="modal-clue">{activeQuestion.question}</p>
				<hr class="divider" />
				<p class="modal-answer">{activeQuestion.answer}</p>
				<p class="modal-hint">click to close</p>
			{/if}
		</div>
	</button>
{/if}

<style>
	.board {
		display: grid;
		height: 100vh;
		width: 100vw;
		gap: 5px;
		background: #000;
		padding: 5px;
	}

	.cat-header {
		background: var(--blue-header);
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 0.6rem 0.4rem;
		font-size: clamp(0.6rem, 1.3vw, 1rem);
		font-weight: 700;
		text-transform: uppercase;
		color: white;
		letter-spacing: 1px;
		word-break: break-word;
		hyphens: auto;
		border: 2px solid #1a1aa0;
	}

	.cell {
		background: var(--blue);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 0.12s;
		border: 2px solid #1a1aa0;
	}

	.cell:hover:not(.done):not(.empty) {
		background: #1818f5;
	}

	.cell.done,
	.cell.empty {
		background: var(--blue-done);
		cursor: default;
		border-color: #06065a;
	}

	.amount {
		font-size: clamp(1.2rem, 3.5vw, 4rem);
		color: var(--gold);
		font-weight: 700;
		text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.6);
		letter-spacing: 1px;
		user-select: none;
	}

	/* Overlay */
	.overlay::-moz-focus-inner {
		border: 0;
	}

	.overlay {
		appearance: none;
		font: inherit;
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 16, 0.93);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		cursor: pointer;
		padding: 3rem 2rem;
	}

	.modal {
		text-align: center;
		max-width: 1000px;
		width: 100%;
		pointer-events: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.modal-category {
		font-size: clamp(0.9rem, 2vw, 1.4rem);
		color: var(--gold);
		text-transform: uppercase;
		letter-spacing: 4px;
		opacity: 0.85;
	}

	.modal-value {
		font-size: clamp(1.5rem, 3vw, 2.5rem);
		color: var(--gold);
		font-weight: 700;
		letter-spacing: 2px;
	}

	.modal-clue {
		font-size: clamp(1.8rem, 4.5vw, 4.5rem);
		line-height: 1.25;
		color: white;
		text-transform: uppercase;
		letter-spacing: 2px;
		margin-top: 0.5rem;
	}

	.divider {
		width: 60%;
		border: none;
		border-top: 3px solid var(--gold);
		opacity: 0.5;
		margin: 0.5rem 0;
	}

	.modal-answer {
		font-size: clamp(1.8rem, 4.5vw, 4.5rem);
		line-height: 1.25;
		color: var(--gold);
		text-transform: uppercase;
		letter-spacing: 2px;
		font-style: italic;
	}

	.modal-hint {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.3);
		text-transform: uppercase;
		letter-spacing: 3px;
		margin-top: 1.5rem;
	}
</style>
