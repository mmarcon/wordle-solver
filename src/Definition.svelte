<script>
  export let word;

  function capitalizeFirstLetter(sentence) {
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  }

  async function define(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const parsed = await response.json();
    if (parsed.length > 0) {
      return { definition: capitalizeFirstLetter(parsed[0]?.meanings[0]?.definitions[0]?.definition), phonetic: parsed[0]?.phonetic };
    }
    return { definition: 'Could not find definition' };
  }

</script>

<div class='definition'>
  {#await define(word)}
    <p class='definition-loader'>Fetching definition...</p>
  {:then {definition, phonetic}} 
    <p>{#if phonetic}
      <span class="phonetic">{phonetic}</span> –
    {/if}{definition}</p>
  {/await}
</div>

<style>
  .definition {
    max-width: 450px;
    text-align: center;
    font-family: 'Georgia', serif;
    font-weight: 500;
    font-style: italic;
    font-size: 18px;
		color: var(--color-text-normal);
  }
  .phonetic {
    font-style: normal;
    font-weight: 700;
  }
</style>