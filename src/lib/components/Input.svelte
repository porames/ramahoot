<script lang="ts">
  let {
    value = $bindable(''),
    id = '',
    type = 'text',
    placeholder = '',
    label = '',
    class: className = ''
  } = $props();
</script>

{#if label}
  <label for={id} class="block text-xs font-bold text-black mb-1.5">{label}</label>
{/if}
<input
  {id}
  {type}
  {placeholder}
  bind:value
  class="w-full border-[3px] border-black rounded-lg bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:shadow-[3px_3px_0px_0px_#111] transition-shadow {className}"
/>
