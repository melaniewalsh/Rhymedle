<script>
	import "$styles/app.css";
	import Header from "$components/Header.svelte";
	import Stats from "$components/Stats.svelte";
	import Info from "$components/Info.svelte";
	import { browser } from "$app/environment";
	import { page } from "$app/stores";
	import { setContext } from "svelte";

	let { children } = $props();

	let showStats = $state(false);
	let showInfo = $state(false);
	let mounted = $state(false);

	// Load hard mode setting from localStorage (synchronously to avoid flash)
	let isHardMode = $state(browser ? localStorage.getItem('rhymedle-hard-mode') === 'true' : false);

	$effect(() => {
		mounted = true;
	});

	function toggleHardMode() {
		isHardMode = !isHardMode;
		if (browser) {
			localStorage.setItem('rhymedle-hard-mode', isHardMode.toString());
		}
	}

	// Provide hard mode to child components
	setContext('hardMode', {
		get isHardMode() {
			return isHardMode;
		}
	});

	// Generate list of past 7 days (including today)
	function getPastDates() {
		const dates = [];
		for (let i = 0; i < 7; i++) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
			const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : dateString;
			dates.push({ value: dateString, label });
		}
		return dates;
	}

	const availableDates = getPastDates();

	// Get selected date from URL params (client-side) or use today
	function getSelectedDate() {
		if (browser) {
			const urlDate = $page.url.searchParams.get('date');
			if (urlDate) return urlDate;
		}
		return availableDates[0].value;
	}

	let selectedDate = $derived(getSelectedDate());

	function changeDate(event) {
		const newDate = event.target.value;
		if (browser) {
			window.location.href = `?date=${newDate}`;
		}
	}

	function openStats() {
		showStats = true;
	}

	function closeStats() {
		showStats = false;
	}

	function openInfo() {
		showInfo = true;
	}

	function closeInfo() {
		showInfo = false;
	}
</script>

<svelte:head>
	<title>Rhymedle</title>
	<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔔</text></svg>" />
	<meta name="description" content="Complete the rhymes in a famous poem! A daily poetry word game." />
	<meta property="og:title" content="Rhymedle" />
	<meta property="og:description" content="Complete the rhymes in a famous poem! A daily poetry word game." />
	<meta property="og:image" content="https://melaniewalsh.github.io/rhymedle/assets/images/rhymedle-logo.png" />
	<meta property="og:url" content="https://melaniewalsh.github.io/rhymedle/" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Rhymedle" />
	<meta name="twitter:description" content="Complete the rhymes in a famous poem! A daily poetry word game." />
	<meta name="twitter:image" content="https://melaniewalsh.github.io/rhymedle/assets/images/rhymedle-logo.png" />
</svelte:head>

<Header {availableDates} {selectedDate} onDateChange={changeDate} {openStats} {openInfo} {isHardMode} {toggleHardMode} />
<main id="content" style:visibility={mounted ? 'visible' : 'hidden'}>
	{@render children?.()}
</main>
<Stats isOpen={showStats} onClose={closeStats} />
<Info isOpen={showInfo} onClose={closeInfo} />

<style>
	:global(body) {
		background-color: #f3fafc;
	}
</style>
