<script>
	import { browser } from "$app/environment";

	let { isOpen = false, onClose = () => {} } = $props();

	function getStatsData() {
		if (!browser) {
			return {
				played: 0,
				avgAccuracy: 0,
				avgAttempts: '0.0',
				gaveUp: 0,
				perfectGames: 0,
				currentStreak: 0,
				maxStreak: 0,
				attemptsDistribution: { 1: 0, 2: 0, 3: 0 },
				totalHints: 0,
				avgHints: '0.0'
			};
		}

		const stored = localStorage.getItem('rhymedle-game');
		if (!stored) {
			return {
				played: 0,
				avgAccuracy: 0,
				avgAttempts: '0.0',
				gaveUp: 0,
				perfectGames: 0,
				currentStreak: 0,
				maxStreak: 0,
				attemptsDistribution: { 1: 0, 2: 0, 3: 0 },
				totalHints: 0,
				avgHints: '0.0'
			};
		}

		try {
			const allGames = JSON.parse(stored);
			const gameEntries = Object.entries(allGames);

			// Only count finished games
			const finishedGames = gameEntries.filter(([, data]) => data.showFinalReveal);
			const played = finishedGames.length;

			let currentStreak = 0;
			let maxStreak = 0;
			let perfectGames = 0;
			let totalAccuracy = 0;
			let totalAttempts = 0;
			let gaveUp = 0;
			let totalHints = 0;
			let gamesWithHints = 0;
			const attemptsDistribution = { 1: 0, 2: 0, 3: 0 };

			// Sort by date
			const sortedEntries = finishedGames.sort(([dateA], [dateB]) => dateA.localeCompare(dateB));

			for (const [, gameData] of sortedEntries) {
				const { attemptsUsed = 0, correctCount = 0, totalCount, showFinalReveal, hintsUsed = 0, fiftyFiftyUsed = 0 } = gameData;

				// Use totalCount if available, otherwise try to calculate from lineResults
				const totalLines = totalCount || gameData.lineResults?.filter(r => r !== null).length || 0;

				if (totalLines === 0) continue; // Skip invalid games

				// Calculate accuracy
				const accuracy = totalLines > 0 ? correctCount / totalLines : 0;
				totalAccuracy += accuracy;

				// Track attempts
				if (attemptsUsed === 0) {
					gaveUp++;
				} else {
					totalAttempts += attemptsUsed;
					// Add to distribution
					if (attemptsUsed >= 1 && attemptsUsed <= 3) {
						attemptsDistribution[attemptsUsed]++;
					}
				}

				// Track perfect games
				if (correctCount === totalLines) {
					perfectGames++;
					currentStreak++;
					if (currentStreak > maxStreak) {
						maxStreak = currentStreak;
					}
				} else {
					currentStreak = 0;
				}

				// Track hints (both hard mode and 50/50)
				const totalHintsUsed = hintsUsed + fiftyFiftyUsed;
				if (totalHintsUsed > 0) {
					totalHints += totalHintsUsed;
					gamesWithHints++;
				}
			}

			const gamesWithAttempts = played - gaveUp;

			return {
				played,
				avgAccuracy: played > 0 ? Math.round((totalAccuracy / played) * 100) : 0,
				avgAttempts: gamesWithAttempts > 0 ? (totalAttempts / gamesWithAttempts).toFixed(1) : '0.0',
				gaveUp,
				perfectGames,
				currentStreak,
				maxStreak,
				attemptsDistribution,
				totalHints,
				avgHints: gamesWithHints > 0 ? (totalHints / gamesWithHints).toFixed(1) : '0.0'
			};
		} catch (e) {
			console.error('Error loading stats:', e);
			return {
				played: 0,
				avgAccuracy: 0,
				avgAttempts: '0.0',
				gaveUp: 0,
				perfectGames: 0,
				currentStreak: 0,
				maxStreak: 0,
				attemptsDistribution: { 1: 0, 2: 0, 3: 0 },
				totalHints: 0,
				avgHints: '0.0'
			};
		}
	}

	const stats = $derived(getStatsData());
	const maxDistribution = $derived(Math.max(...Object.values(stats.attemptsDistribution), 1));
</script>

{#if isOpen}
	<div class="modal-overlay" onclick={onClose}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<button class="close-button" onclick={onClose}>×</button>
			<h2>Statistics</h2>

			<div class="stats-tiles">
				<div class="stat-tile">
					<div class="stat-value">{stats.played}</div>
					<div class="stat-label">Played</div>
				</div>
				<div class="stat-tile">
					<div class="stat-value">{stats.avgAccuracy}%</div>
					<div class="stat-label">Avg Accuracy</div>
				</div>
				<div class="stat-tile">
					<div class="stat-value">{stats.avgAttempts}</div>
					<div class="stat-label">Avg Attempts</div>
				</div>
				<div class="stat-tile">
					<div class="stat-value">{stats.gaveUp}</div>
					<div class="stat-label">Gave Up</div>
				</div>
			</div>

			<div class="stats-tiles" style="margin-top: 1rem;">
				<div class="stat-tile">
					<div class="stat-value">{stats.perfectGames}</div>
					<div class="stat-label">Perfect Games</div>
				</div>
				<div class="stat-tile">
					<div class="stat-value">{stats.currentStreak}</div>
					<div class="stat-label">Perfect Streak</div>
				</div>
				<div class="stat-tile">
					<div class="stat-value">{stats.maxStreak}</div>
					<div class="stat-label">Best Streak</div>
				</div>
				<div class="stat-tile">
					<div class="stat-value">{stats.avgHints}</div>
					<div class="stat-label">Avg Hints</div>
				</div>
			</div>

			<div class="attempts-distribution">
				<h3>Attempts Distribution</h3>
				<div class="distribution-bars">
					{#each Object.entries(stats.attemptsDistribution) as [attempts, count]}
						<div class="distribution-row">
							<div class="attempts-label">{attempts}</div>
							<div class="bar-container">
								<div
									class="bar"
									style="width: {Math.max((count / maxDistribution) * 100, count > 0 ? 10 : 0)}%"
								>
									<span class="count">{count}</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
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

	.stats-tiles {
		display: flex;
		justify-content: space-around;
		margin-bottom: 2rem;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.stat-tile {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 80px;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: bold;
		color: rgb(16, 73, 60);
	}

	.stat-label {
		font-size: 0.85rem;
		color: #666;
		text-align: center;
	}

	.attempts-distribution {
		margin-top: 2rem;
	}

	.attempts-distribution h3 {
		font-size: 1.2rem;
		font-weight: bold;
		margin-bottom: 1rem;
		color: #333;
	}

	.distribution-bars {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.distribution-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.attempts-label {
		font-weight: bold;
		width: 20px;
		text-align: right;
	}

	.bar-container {
		flex: 1;
	}

	.bar {
		background: rgb(16, 73, 60);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		min-width: 30px;
		display: flex;
		justify-content: flex-end;
		transition: width 0.3s ease;
	}

	.count {
		color: white;
		font-weight: bold;
		font-size: 0.9rem;
	}
</style>
