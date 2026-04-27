<div class="home">
	<h1>Jeopardy!</h1>
	<div class="actions">
		<a href="/create" class="btn btn-primary">Create a Board</a>
		<a href="/boards" class="btn btn-secondary">Browse Boards</a>
	</div>
</div>

<style>
	.home {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2.5rem;
	}

	h1 {
		font-size: clamp(4rem, 12vw, 8rem);
		color: var(--gold);
		text-transform: uppercase;
		text-shadow:
			4px 4px 0 #000,
			-2px -2px 0 #000;
		letter-spacing: 6px;
		font-weight: 700;
	}

	.actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.btn {
		font-weight: 700;
		padding: 1rem 2.5rem;
		font-size: 1.3rem;
		text-decoration: none;
		text-transform: uppercase;
		letter-spacing: 3px;
		transition: background 0.15s;
	}

	.btn-primary {
		background: var(--gold);
		color: #000;
		border: 4px solid #000;
	}

	.btn-primary:hover {
		background: #ffaa00;
	}

	.btn-secondary {
		background: transparent;
		color: var(--gold);
		border: 4px solid var(--gold);
	}

	.btn-secondary:hover {
		background: rgba(255, 204, 0, 0.1);
	}
</style>
