<script>
	let {
		availableDates = [],
		selectedDate = "",
		onDateChange = () => {}
	} = $props();
</script>

<footer>
	<div class="footer-content">
		<label for="date-select">Play another game:</label>
		<select
			id="date-select"
			class="date-select"
			value={selectedDate}
			onchange={onDateChange}
		>
			{#each availableDates as dateOption}
				<option value={dateOption.value}>{dateOption.label}</option>
			{/each}
		</select>
	</div>
	</footer>

<style>
	footer {
		background-color: #d9eef3;
		padding: 1rem;
		margin-top: auto;
	}

	.footer-content {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		max-width: 500px;
		margin: 0 auto;
	}

	label {
		font-family: "Baskerville", "Georgia", serif;
		font-size: 0.9rem;
		color: #333;
	}

	.date-select {
		font-family: "Baskerville", "Georgia", serif;
		font-size: 0.9rem;
		padding: 0.3rem 0.5rem;
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		background: white;
		color: #333;
		cursor: pointer;
		transition: all 0.2s;
	}

	.date-select:hover {
		border-color: rgba(0, 0, 0, 0.4);
		background: white;
	}

	.date-select:focus {
		outline: none;
		border-color: rgba(0, 0, 0, 0.5);
	}

	@media (max-width: 640px) {
		label {
			font-size: 0.8rem;
		}

		.date-select {
			font-size: 0.8rem;
			padding: 0.25rem 0.4rem;
		}
	}
</style>
