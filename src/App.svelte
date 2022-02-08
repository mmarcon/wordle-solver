<script>
	import Letter from './Letter.svelte';
	import Wordle from './wordle';
	
	const w = new Wordle();

	let words = ['world'];
	let candidateWords = ['float', 'prime', 'cross'];

	function nextWord() {
		words = [...words, candidateWords.shift()];
	}
</script>

<svelte:head>
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
	<style>
		body {
			background-color: #121213;
		}
	</style>
</svelte:head>

<main>
	{#each words as word, i}
		<div class="entry">
			<div class="word">
				{#each word.split('') as l}
					<Letter letter="{l}" color="" frozen={i < words.length - 1}></Letter>
				{/each}
			</div>
			<button class="next" on:click={nextWord}>Next Word</button>
		</div>
	{/each}
</main>

<style>
	.entry {
		margin-top: 10px;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}
	.word {
		background-color: #121213;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.next {
		font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
		background-color: transparent;
		color: #d7dadc;
		text-transform: uppercase;
		border: 2px solid #d7dadc;
		font-size: 14px;
		font-weight: 600;
		line-height: 20px;
		padding: 2px 4px;
		margin: 0 0 0 5px;
		visibility: hidden;
		border-radius: 10px;
	}
	.entry:last-child .next {
		visibility: visible;
	}
</style>