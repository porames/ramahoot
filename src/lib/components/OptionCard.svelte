<script lang="ts">
  let {
    value = $bindable(''),
    letter = '',
    name = '',
    group = $bindable(''),
    optionId = '',
    class: className = ''
  } = $props();

  let selected = $derived(group === optionId);
</script>

<div
  class="flex border-[3px] border-black rounded-lg overflow-hidden transition-all {className}"
  class:shadow-[3px_3px_0px_0px_#111]={selected}
  style="background-color: {selected ? 'rgba(23, 201, 100, 0.1)' : 'transparent'};"
>
  <label
    class="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors border-r-[3px] border-black"
    class:bg-[#17C964]={selected}
    class:bg-white={!selected}
    class:hover:bg-slate-50={!selected}
  >
    <input
      type="radio"
      tabindex="-1"
      {name}
      bind:group
      value={optionId}
      class="accent-black w-4 h-4 cursor-pointer"
    />
    <span class="font-black text-sm w-4 text-center">{letter}</span>
  </label>
  <input
    bind:value
    type="text"
    placeholder={letter}
    class="w-full flex-1 px-4 py-2 text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none bg-white"
  />
</div>
