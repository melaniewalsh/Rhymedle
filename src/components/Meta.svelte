<script>
	let {
		title = "Rhymedle - Daily Poetry Rhyme Game",
		description = "Test your poetry knowledge! Complete the rhymes in classic poems and guess the author. A new poem every day.",
		url = "https://melaniewalsh.github.io/Rhymedle",
		keywords = "poetry, rhyme, game, daily, wordle, literature",
		preloadFont = []
	} = $props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="author" content="Melanie Walsh" />
	<meta name="news_keywords" content={keywords} />

	<meta property="og:title" content={title} />
	<meta property="og:site_name" content="Rhymedle" />
	<meta property="og:url" content={url} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="en_US" />

	<meta property="og:image" content="{url}/assets/social.png" />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="628" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image:src" content="{url}/assets/social.png" />

	<meta name="robots" content="max-image-preview:large" />

	<link rel="canonical" href="{url}/" />

	{#each preloadFont as href}
		<link rel="preload" {href} as="font" type="font/woff2" crossorigin />
	{/each}
</svelte:head>
