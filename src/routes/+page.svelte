<script>
	import { setContext } from "svelte";
	import Index from "$components/Index.svelte";

	let { data } = $props();

	setContext("data", data);
</script>

<svelte:head>
	<title>Rhymedle - Daily Poetry Rhyme Game</title>
	<meta name="description" content="Guess the rhyming word to complete the poem" />
</svelte:head>

<Index />
