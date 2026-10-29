<script lang="ts">
	import type { PageData } from './$types';
	import type { JeopardyBoard, JeopardyQuestion } from '$lib/types';
	import { renderMath } from '$lib/math';
	import 'katex/dist/katex.min.css';

	let { data }: { data: PageData } = $props();
	const board = $derived(data.board);

	const values = $derived(
		[...new Set(board.categories.flatMap((c) => c.questions.map((q) => q.value)))].sort(
			(a, b) => a - b
		)
	);

	// --- Sounds ---
	function play(src: string) {
		new Audio(src).play().catch(() => {});
	}

	$effect(() => {
		play('/sounds/jeopardy-board-fill-sound.mp3');
	});

	// --- Daily Doubles ---
	function generateDailyDoubles(b: JeopardyBoard, vals: number[]): Set<string> {
		const N = vals.length;
		const peak = Math.max(0, N - 2);
		const weights = vals.map((_, i) => Math.exp(-0.7 * (i - peak) ** 2));

		const result = new Set<string>();
		const usedCols = new Set<number>();

		for (let n = 0; n < 2; n++) {
			const availableCols = b.categories
				.map((_, i) => i)
				.filter((i) => !usedCols.has(i))
				.sort(() => Math.random() - 0.5);

			for (const col of availableCols) {
				const total = weights.reduce((a, w) => a + w, 0);
				let rand = Math.random() * total;
				let rowIdx = N - 1;
				for (let i = 0; i < N; i++) {
					rand -= weights[i];
					if (rand <= 0) {
						rowIdx = i;
						break;
					}
				}
				const value = vals[rowIdx];
				if (b.categories[col].questions.some((q) => q.value === value)) {
					result.add(`${col}-${value}`);
					usedCols.add(col);
					break;
				}
			}
		}

		return result;
	}

	const dailyDoublesEnabled = $derived(data.dailyDoubles);
	let dailyDoubleKeys = $state<Set<string>>(new Set());

	$effect(() => {
		if (dailyDoublesEnabled) {
			dailyDoubleKeys = generateDailyDoubles(board, values);
		} else {
			dailyDoubleKeys = new Set();
		}
	});

	// --- Game state ---
	let cellStates = $state<Record<string, 'done'>>({});

	// One verdict per tile, kept separately from cellStates so re-opening a tile
	// never adds or removes points; judging it again just replaces the verdict.
	type Verdict = 'right' | 'wrong';
	let verdicts = $state<Record<string, Verdict>>({});

	const score = $derived(
		Object.entries(verdicts).reduce((total, [key, result]) => {
			const value = Number(key.split('-')[1]);
			if (result === 'right') return total + value;
			if (result === 'wrong') return total - value;
			return total;
		}, 0)
	);

	let activeQuestion = $state<JeopardyQuestion | null>(null);
	let activeCatName = $state('');
	let activeCellKey = $state('');
	let modalStage = $state<'daily_double' | 'question' | 'answer'>('question');

	const HOLD_MS = 500;

	function openCell(catIdx: number, value: number) {
		const key = `${catIdx}-${value}`;
		if (cellStates[key]) return;

		const cat = board.categories[catIdx];
		const question = cat.questions.find((q) => q.value === value);
		if (!question) return;

		activeQuestion = question;
		activeCatName = cat.name;
		activeCellKey = key;
		pressStartedOnOverlay = false;

		if (dailyDoubleKeys.has(key)) {
			modalStage = 'daily_double';
			play('/sounds/jeopardy-daily-double-sound-effect-from-youtube_76mCCAq.mp3');
		} else {
			modalStage = 'question';
			play('/sounds/jeopardy-ding.mp3');
		}
	}

	// --- Hold to choose a tile ---
	let holdingCellKey = $state('');
	let cellHoldTimer: ReturnType<typeof setTimeout> | undefined;

	function startCellHold(catIdx: number, value: number) {
		const key = `${catIdx}-${value}`;
		if (cellStates[key] || holdingCellKey) return;
		holdingCellKey = key;
		cellHoldTimer = setTimeout(() => {
			holdingCellKey = '';
			openCell(catIdx, value);
		}, HOLD_MS);
	}

	function cancelCellHold() {
		clearTimeout(cellHoldTimer);
		holdingCellKey = '';
	}

	// Clicking a completed tile undoes it (for mis-clicks)
	function resetCell(key: string) {
		delete cellStates[key];
	}

	// The finger that held a tile open lifts on top of the overlay, and iPad turns
	// that into a click. Only count clicks whose press began on the overlay.
	let pressStartedOnOverlay = false;

	function handleOverlayClick() {
		if (!pressStartedOnOverlay) return;
		pressStartedOnOverlay = false;
		advance();
	}

	function closeQuestion(verdict?: Verdict) {
		cellStates[activeCellKey] = 'done';
		if (verdict) verdicts[activeCellKey] = verdict;
		activeQuestion = null;
		activeCellKey = '';
	}

	function advance() {
		if (!activeQuestion) return;
		if (modalStage === 'daily_double') {
			modalStage = 'question';
		} else if (modalStage === 'question') {
			modalStage = 'answer';
		} else {
			closeQuestion();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!activeQuestion) return;
		if (e.key === 'Escape') {
			closeQuestion();
		} else if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			if (!e.repeat) advance();
		}
	}

	function handleKeyup(e: KeyboardEvent) {
		if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
	}
</script>

<svelte:head>
	<title>{board.title} – Jeopardy</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} onkeyup={handleKeyup} />

<div class="score" class:negative={score < 0}>
	{score < 0 ? '-' : ''}${Math.abs(score).toLocaleString()}
</div>

<div
	class="board"
	style:grid-template-columns="repeat({board.categories.length}, 1fr)"
	style:grid-template-rows="repeat({values.length + 1}, 1fr)"
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
					class:holding={holdingCellKey === key}
					onclick={() => isDone && resetCell(key)}
					onpointerdown={() => startCellHold(catIdx, value)}
					onpointerup={cancelCellHold}
					onpointerleave={cancelCellHold}
					onpointercancel={cancelCellHold}
					oncontextmenu={(e) => e.preventDefault()}
					onkeydown={(e) => {
						if (e.key !== 'Enter' && e.key !== ' ') return;
						e.preventDefault();
						if (e.repeat) return;
						if (isDone) resetCell(key);
						else startCellHold(catIdx, value);
					}}
					onkeyup={cancelCellHold}
				>
					{#if !isDone}
						<span class="amount">${value}</span>
						<div class="hold-fill cell-hold-fill" style:animation-duration="{HOLD_MS}ms"></div>
						<button
							class="eliminate"
							tabindex="-1"
							aria-label="Eliminate tile"
							onpointerdown={(e) => e.stopPropagation()}
							onclick={(e) => {
								e.stopPropagation();
								cellStates[key] = 'done';
							}}>×</button
						>
					{/if}
				</div>
			{:else}
				<div class="cell empty"></div>
			{/if}
		{/each}
	{/each}
</div>

{#if activeQuestion}
	<button
		class="overlay"
		onclick={handleOverlayClick}
		onpointerdown={() => (pressStartedOnOverlay = true)}
		oncontextmenu={(e) => e.preventDefault()}
		aria-label={modalStage === 'daily_double'
			? 'See the clue'
			: modalStage === 'question'
				? 'Reveal answer'
				: 'Close'}
	>
		{#if modalStage === 'daily_double'}
			<div class="modal dd-modal">
				<p class="dd-line">Daily</p>
				<p class="dd-line dd-line-big">Double!</p>
				<p class="modal-hint">click to see the clue</p>
			</div>
		{:else}
			<div class="modal" class:showing-answer={modalStage === 'answer'}>
				<p class="modal-category">{activeCatName}</p>
				<p class="modal-value">${activeQuestion.value}</p>

				{#if modalStage === 'question'}
					<p class="modal-clue">{@html renderMath(activeQuestion.question)}</p>
					<p class="modal-hint">click to reveal answer</p>
				{:else}
					<p class="modal-clue">{@html renderMath(activeQuestion.question)}</p>
					<hr class="divider" />
					<p class="modal-answer">{@html renderMath(activeQuestion.answer)}</p>
					<p class="modal-hint">click to close</p>
				{/if}
			</div>
		{/if}
	</button>

	{#if modalStage === 'answer'}
		<div class="judge">
			<button class="judge-btn right" aria-label="Correct" onclick={() => closeQuestion('right')}
				>✓</button
			>
			<button class="judge-btn wrong" aria-label="Incorrect" onclick={() => closeQuestion('wrong')}
				>✗</button
			>
		</div>
	{/if}
{/if}

<style>
	.board {
		display: grid;
		height: 100vh;
		width: 100vw;
		gap: 5px;
		background: #000;
		padding: 5px;
		/* Keep the board clear of the iPad status bar when launched from the home screen */
		padding-top: max(5px, env(safe-area-inset-top));
	}

	/* Stop iPad long-press from selecting text or popping a callout during holds */
	.board,
	.overlay {
		-webkit-user-select: none;
		user-select: none;
		-webkit-touch-callout: none;
	}

	.cat-header {
		background: var(--blue-header);
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 0.6rem 0.4rem;
		font-family: var(--font-board);
		font-size: clamp(1rem, min(2.5vw, 4.5vh), 3rem);
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
		position: relative;
		overflow: hidden;
	}

	.eliminate {
		position: absolute;
		top: 2px;
		right: 4px;
		padding: 0 2px;
		background: none;
		border: none;
		font-size: 0.8rem;
		line-height: 1;
		color: rgba(255, 255, 255, 0.12);
		cursor: pointer;
	}

	.eliminate:hover {
		color: rgba(255, 255, 255, 0.5);
	}

	.cell .cell-hold-fill {
		position: absolute;
		left: 0;
		bottom: 0;
		height: 5px;
	}

	.cell:hover:not(.done):not(.empty) {
		background: #1818f5;
	}

	.cell.done,
	.cell.empty {
		background: var(--blue-done);
		border-color: #06065a;
	}

	.cell.empty {
		cursor: default;
	}

	.amount {
		font-family: var(--font-board);
		font-size: clamp(2rem, min(6vw, 10vh), 9rem);
		color: var(--gold);
		font-weight: 700;
		text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.6);
		letter-spacing: 2px;
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
		background: var(--blue);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		cursor: pointer;
		padding: 2rem;
		/* Room for the right/wrong buttons */
		padding-bottom: 5rem;
	}

	.modal {
		text-align: center;
		max-width: 1100px;
		max-height: calc(100vh - 7rem);
		width: 100%;
		overflow: hidden;
		pointer-events: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.modal-category {
		font-family: var(--font-board);
		font-size: clamp(0.75rem, min(1.8vw, 2.5vh), 1.3rem);
		color: white;
		text-transform: uppercase;
		letter-spacing: 4px;
		opacity: 0.7;
		text-shadow: 1px 1px 3px #000;
		flex-shrink: 0;
	}

	.modal-value {
		font-family: var(--font-board);
		font-size: clamp(1rem, min(2.5vw, 3.5vh), 2rem);
		color: var(--gold);
		font-weight: 700;
		letter-spacing: 2px;
		text-shadow: 2px 2px 0 #000;
		margin-bottom: 0.5rem;
		flex-shrink: 0;
	}

	.showing-answer .modal-value {
		margin-bottom: 0.15rem;
	}

	.modal-clue {
		font-family: var(--font-clue);
		font-size: clamp(1.5rem, min(5vw, 10vh), 5.5rem);
		line-height: 1.2;
		color: white;
		text-transform: uppercase;
		letter-spacing: 2px;
		text-shadow:
			2px 3px 0 #000,
			-1px -1px 0 rgba(0, 0, 0, 0.4);
		font-weight: 700;
	}

	/* Shrink the question when the answer is also on screen */
	.showing-answer .modal-clue {
		font-size: clamp(1rem, min(2.5vw, 4.5vh), 2.5rem);
		opacity: 0.65;
	}

	.divider {
		width: 50%;
		border: none;
		border-top: 3px solid rgba(255, 255, 255, 0.35);
		margin: 0.5rem 0 0.25rem;
		flex-shrink: 0;
	}

	.modal-answer {
		font-family: var(--font-clue);
		font-size: clamp(1.5rem, min(5vw, 10vh), 5.5rem);
		line-height: 1.2;
		color: var(--gold);
		text-transform: uppercase;
		letter-spacing: 2px;
		text-shadow:
			2px 3px 0 #000,
			-1px -1px 0 rgba(0, 0, 0, 0.4);
		font-weight: 700;
	}

	/* Math must keep its case (x vs X) and stays legible without the heavy shadow */
	.modal-clue :global(.katex),
	.modal-answer :global(.katex) {
		text-transform: none;
		letter-spacing: normal;
		text-shadow: 2px 2px 0 #000;
	}

	.modal-clue :global(.katex-display),
	.modal-answer :global(.katex-display) {
		margin: 0.25em 0;
	}

	.modal-hint {
		font-size: 0.65rem;
		color: rgba(255, 255, 255, 0.25);
		text-transform: uppercase;
		letter-spacing: 3px;
		margin-top: 0.75rem;
		flex-shrink: 0;
	}

	/* Hold-to-choose progress */
	.hold-fill {
		height: 100%;
		width: 0;
		background: var(--gold);
	}

	.holding .hold-fill {
		animation: hold-fill linear forwards;
	}

	@keyframes hold-fill {
		to {
			width: 100%;
		}
	}

	/* Right / wrong buttons */
	.judge {
		position: fixed;
		bottom: max(1.25rem, env(safe-area-inset-bottom));
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 1rem;
		z-index: 101;
	}

	.judge-btn {
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 50%;
		border: none;
		font-size: 1.25rem;
		font-weight: 700;
		color: white;
		cursor: pointer;
		opacity: 0.7;
	}

	.judge-btn:hover {
		opacity: 1;
	}

	.judge-btn.right {
		background: #1f9d4a;
	}

	.judge-btn.wrong {
		background: #c8322d;
	}

	/* Score */
	.score {
		position: fixed;
		top: max(8px, env(safe-area-inset-top));
		right: 10px;
		z-index: 50;
		padding: 2px 8px;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.45);
		font-family: var(--font-board);
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--gold);
		pointer-events: none;
	}

	.score.negative {
		color: #ff6b6b;
	}

	/* Daily Double screen */
	.dd-modal {
		justify-content: center;
		gap: 0;
	}

	.dd-line {
		font-family: var(--font-clue);
		color: var(--gold);
		font-weight: 700;
		font-style: italic;
		text-transform: uppercase;
		line-height: 0.88;
		text-shadow:
			4px 6px 0 #000,
			0 0 60px rgba(255, 204, 0, 0.25);
		letter-spacing: 2px;
	}

	.dd-line:first-child {
		font-size: clamp(3rem, min(12vw, 18vh), 14rem);
	}

	.dd-line-big {
		font-size: clamp(4rem, min(18vw, 26vh), 20rem);
	}

</style>
