<script>
	let { isOpen = false, onClose = () => {} } = $props();
</script>

{#if isOpen}
	<div class="modal-overlay" onclick={onClose}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<button class="close-button" onclick={onClose}>×</button>
			<h2>How to Play</h2>

			<div class="section">
				<p>Complete the rhymes in a famous poem by selecting or typing the missing words!</p>
			</div>

			<div class="section">
				<h3>Game Modes</h3>
				<div class="mode-info">
					<div class="mode">
						<span class="mode-name">Easy Mode</span>
						<span class="mode-desc">Select the correct rhyming word from a dropdown of 3 choices.</span>
					</div>
					<div class="mode">
						<span class="mode-name">Hard Mode</span>
						<span class="mode-desc">Type the rhyming word yourself with no choices provided.</span>
					</div>
				</div>
			</div>

			<div class="section">
				<h3>How to Win</h3>
				<ul>
					<li>Fill in all the missing words in the poem</li>
					<li>Click "Check Answer" to see how you did</li>
					<li>You have 3 attempts to get all rhymes correct</li>
					<li>After completing the rhymes, guess the poem's author!</li>
				</ul>
			</div>

			<div class="section">
				<h3>Hints</h3>
				<ul>
					<li><strong>Easy Mode:</strong> Use 50/50 to narrow choices down to 2 options</li>
					<li><strong>Hard Mode:</strong> Reveal letters one at a time</li>
				</ul>
			</div>

			<div class="section">
				<p class="new-game">A new Rhymedle is available every day!</p>
			</div>

			<div class="section credits">
				<p>
					Made by <a href="https://melaniewalsh.org/" target="_blank" rel="noopener noreferrer">Melanie Walsh</a>.
				</p>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-content {
		background: #fefef8;
		border: 1px solid black;
		border-radius: 8px;
		padding: 2rem;
		max-width: 500px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
		font-family: 'Baskerville', 'Georgia', serif;
	}

	.close-button {
		position: absolute;
		top: 0.5rem;
		right: 1rem;
		background: none;
		border: none;
		font-size: 2rem;
		cursor: pointer;
		color: #666;
		line-height: 1;
	}

	.close-button:hover {
		color: #333;
	}

	h2 {
		text-align: center;
		font-size: 1.5rem;
		font-weight: bold;
		margin-bottom: 1.5rem;
		color: rgb(16, 73, 60);
	}

	h3 {
		font-size: 1.1rem;
		font-weight: bold;
		margin-bottom: 0.75rem;
		color: #333;
	}

	.section {
		margin-bottom: 1.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid #ddd;
	}

	.section:last-child {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}

	.section p {
		margin: 0;
		line-height: 1.6;
	}

	.mode-info {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.mode {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.mode-name {
		font-weight: bold;
		color: rgb(16, 73, 60);
	}

	.mode-desc {
		color: #555;
		font-size: 0.95rem;
	}

	ul {
		margin: 0;
		padding-left: 1.5rem;
	}

	li {
		margin-bottom: 0.5rem;
		line-height: 1.5;
	}

	li:last-child {
		margin-bottom: 0;
	}

	.new-game {
		text-align: center;
		font-weight: bold;
		color: rgb(16, 73, 60);
	}

	.credits {
		text-align: center;
		font-size: 0.9rem;
		color: #666;
	}

	.credits a {
		color: rgb(16, 73, 60);
		text-decoration: underline;
	}

	.credits a:hover {
		color: #333;
	}
</style>
