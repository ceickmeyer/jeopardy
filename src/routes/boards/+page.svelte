<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();
	const boards = $derived(data.boards);
</script>

<svelte:head>
	<title>All Boards – Jeopardy</title>
</svelte:head>

<div class="page">
	<header>
		<a href="/">← Back</a>
		<h1>All Boards</h1>
		<a href="/create" class="create-btn">+ New Board</a>
	</header>

	{#if boards.length === 0}
		<p class="empty">No boards yet. <a href="/create">Create one!</a></p>
	{:else}
		<ul class="board-list">
			{#each boards as board}
				<li class="board-item">
					<div class="board-info">
						<span class="board-title">{board.title}</span>
						<span class="board-meta">
							/{board.slug} &nbsp;·&nbsp;
							{new Date(board.created_at).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
								year: 'numeric'
							})}
						</span>
					</div>
					<div class="board-actions">
						<a href="/board/{board.slug}" class="btn-play">Play</a>
						<a href="/board/{board.slug}?dd=1" class="btn-play btn-dd">Play with Daily Doubles</a>
						<form
							method="POST"
							action="?/delete"
							use:enhance={() => {
								return async ({ update }) => update({ reset: false });
							}}
						>
							<input type="hidden" name="slug" value={board.slug} />
							<button
								type="submit"
								class="btn-delete"
								onclick={(e) => {
									if (!confirm(`Delete "${board.title}"?`)) e.preventDefault();
								}}
							>
								Delete
							</button>
						</form>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.page {
		max-width: 860px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
		min-height: 100vh;
	}

	header {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	header a:first-child {
		color: var(--gold);
		text-decoration: none;
		font-size: 1rem;
		letter-spacing: 1px;
		opacity: 0.85;
		white-space: nowrap;
	}

	header a:first-child:hover {
		opacity: 1;
	}

	h1 {
		font-size: 2rem;
		color: var(--gold);
		text-transform: uppercase;
		letter-spacing: 3px;
		font-weight: 700;
		flex: 1;
	}

	.create-btn {
		background: var(--gold);
		color: #000;
		text-decoration: none;
		font-weight: 700;
		padding: 0.5rem 1.25rem;
		text-transform: uppercase;
		letter-spacing: 2px;
		font-size: 0.875rem;
		white-space: nowrap;
		transition: background 0.15s;
	}

	.create-btn:hover {
		background: #ffaa00;
	}

	.empty {
		text-align: center;
		color: rgba(255, 255, 255, 0.5);
		margin-top: 4rem;
		font-size: 1.1rem;
		letter-spacing: 1px;
	}

	.empty a {
		color: var(--gold);
		text-decoration: none;
	}

	.board-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.board-item {
		background: var(--blue-dark);
		border: 2px solid var(--border);
		padding: 1rem 1.25rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.board-info {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		min-width: 0;
	}

	.board-title {
		font-size: 1.2rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 2px;
		color: white;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.board-meta {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.4);
		letter-spacing: 1px;
		font-family: 'Courier New', monospace;
	}

	.board-actions {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		flex-shrink: 0;
		align-items: stretch;
	}

	.btn-play {
		background: var(--gold);
		color: #000;
		text-decoration: none;
		font-weight: 700;
		padding: 0.5rem 1.25rem;
		text-transform: uppercase;
		letter-spacing: 2px;
		font-size: 0.875rem;
		transition: background 0.15s;
		text-align: center;
	}

	.btn-play:hover {
		background: #ffaa00;
	}

	.btn-dd {
		background: transparent;
		color: var(--gold);
		border: 2px solid var(--gold);
		font-size: 0.75rem;
	}

	.btn-dd:hover {
		background: rgba(255, 204, 0, 0.1);
	}

	.btn-delete {
		background: transparent;
		color: rgba(255, 255, 255, 0.4);
		border: 2px solid rgba(255, 255, 255, 0.2);
		font-family: 'Korinna', 'ITC Korinna', serif;
		font-weight: 700;
		padding: 0.5rem 1rem;
		text-transform: uppercase;
		letter-spacing: 2px;
		font-size: 0.875rem;
		cursor: pointer;
		transition:
			color 0.15s,
			border-color 0.15s;
	}

	.btn-delete:hover {
		color: #ff6b6b;
		border-color: #ff6b6b;
	}
</style>
