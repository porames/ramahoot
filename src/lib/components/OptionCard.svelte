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
  class="flex rounded-xl border border-slate-300 overflow-hidden transition-colors {className}"
  class:border-emerald-500={selected}
  class:bg-emerald-50={selected}
>
  <label
    class="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors border-r border-slate-200"
    class:bg-slate-50={!selected}
    class:hover:bg-slate-100={!selected}
    class:bg-emerald-100={selected}
  >
    <input
      type="radio"
      tabindex="-1"
      {name}
      bind:group
      value={optionId}
      class="accent-indigo-600 w-4 h-4 cursor-pointer"
    />
    <span class="font-semibold text-sm w-4 text-center">{letter}</span>
  </label>
  <input
    bind:value
    type="text"
    placeholder={letter}
    class="w-full flex-1 px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white/80 bg-transparent"
  />
</div>
