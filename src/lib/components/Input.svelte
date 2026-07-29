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
  <label for={id} class="block text-sm font-medium text-slate-700 mb-1">{label}</label>
{/if}
<input
  {id}
  {type}
  {placeholder}
  bind:value
  class="w-full rounded-xl bg-white border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 {className}"
/>
