<div class="home">
	<h1>Jeopardy!</h1>
	<a href="/create" class="btn">Create a Board</a>
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

	.btn {
		background: var(--gold);
		color: #000;
		font-weight: 700;
		padding: 1rem 3rem;
		font-size: 1.5rem;
		text-decoration: none;
		text-transform: uppercase;
		letter-spacing: 3px;
		border: 4px solid #000;
		transition: background 0.15s;
	}

	.btn:hover {
		background: #ffaa00;
	}
</style>
