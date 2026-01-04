<script>
	let {
		openStats = () => {},
		openInfo = () => {},
		isHardMode = false,
		toggleHardMode = () => {}
	} = $props();
</script>

<header>
	<nav class="nav-bar">
		<div class="nav-left">
			<div class="mode-toggle">
				<span class="mode-label" class:active={isHardMode}>Hard</span>
				<div class="toggle-switch" onclick={toggleHardMode} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && toggleHardMode()}>
					<div class="toggle-track" class:easy={!isHardMode}></div>
					<div class="toggle-thumb" class:easy={!isHardMode}></div>
				</div>
				<span class="mode-label" class:active={!isHardMode}>Easy</span>
			</div>
		</div>
		<h1>🔔 Rhymedle</h1>
		<div class="nav-right">
			<button class="icon-button" onclick={openInfo} title="How to Play">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
			<button class="icon-button" onclick={openStats} title="View Statistics">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"
					/>
				</svg>
			</button>
		</div>
	</nav>
</header>

<style>
	header {
		text-align: center;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #ccc;
	}

	.nav-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 500px;
		margin: 0 auto;
	}

	.nav-left {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 0.5rem;
		width: 120px;
	}

	.icon-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.25rem;
		color: #666;
		transition: color 0.2s;
	}

	.icon-button svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	.icon-button:hover {
		color: #333;
	}

	.nav-right {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		width: 120px;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: bold;
		margin: 0;
	}

	.mode-toggle {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.75rem;
	}

	.mode-label {
		font-family: "Baskerville", "Georgia", serif;
		color: #666;
		transition: all 0.2s;
	}

	.mode-label.active {
		font-weight: bold;
		color: #333;
	}

	.toggle-switch {
		position: relative;
		display: inline-block;
		width: 2.25rem;
		height: 1.125rem;
		cursor: pointer;
	}

	.toggle-track {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgb(16, 73, 59);
		border-radius: 9999px;
		transition: background-color 0.2s;
	}

	.toggle-track.easy {
		background-color: rgb(210, 167, 16);
	}

	.toggle-thumb {
		position: absolute;
		top: 0.125rem;
		left: 0.125rem;
		width: 0.875rem;
		height: 0.875rem;
		background-color: white;
		border-radius: 9999px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		transition: transform 0.2s;
	}

	.toggle-thumb.easy {
		transform: translateX(1.125rem);
	}

	@media (max-width: 640px) {
		h1 {
			font-size: 1.25rem;
		}

		.nav-left, .nav-right {
			width: 80px;
		}

		.icon-button svg {
			width: 1rem;
			height: 1rem;
		}

		.mode-toggle {
			font-size: 0.65rem;
			gap: 0.15rem;
		}

		.toggle-switch {
			width: 1.75rem;
			height: 0.875rem;
		}

		.toggle-thumb {
			width: 0.625rem;
			height: 0.625rem;
			top: 0.125rem;
			left: 0.125rem;
		}

		.toggle-thumb.easy {
			transform: translateX(0.875rem);
		}
	}
</style>
