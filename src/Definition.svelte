<script>
  export let word;

  async function define(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const parsed = await response.json();
    if (parsed.length > 0) {
      return parsed[0]?.meanings[0]?.definitions[0]?.definition;
    }
    return 'Could not find definition';
  }

</script>

<div class='definition'>
  {#await define(word)}
    <p class='definition-loader'>Fetching definition</p>
  {:then definition} 
    <p>{definition}</p>
  {/await}
</div>

<style>
  .definition {
    max-width: 450px;
    text-align: center;
    font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
    font-weight: 500;
    font-style: italic;
    font-size: 16px;
		color: #d7dadc;
  }

  .definition p::first-letter {
    text-transform: uppercase;
  }
</style>