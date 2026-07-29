<script lang="ts">
  interface SelectOption {
    value: string | number;
    label: string;
  }

  let {
    value = $bindable('' as string | number),
    id = '',
    label = '',
    options = [] as SelectOption[],
    class: className = ''
  }: {
    value: string | number;
    id?: string;
    label?: string;
    options: SelectOption[];
    class?: string;
  } = $props();
</script>

{#if label}
  <label for={id} class="block text-sm font-medium text-slate-700 mb-1">{label}</label>
{/if}
<select
  {id}
  bind:value
  class="rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 {className}"
>
  {#each options as opt}
    <option value={opt.value}>{opt.label}</option>
  {/each}
</select>
