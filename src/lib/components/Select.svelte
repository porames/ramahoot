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
  <label for={id} class="block text-xs font-bold text-black mb-1.5">{label}</label>
{/if}
<select
  {id}
  bind:value
  class="border-[3px] border-black rounded-lg bg-white px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:shadow-[3px_3px_0px_0px_#111] transition-shadow {className}"
>
  {#each options as opt}
    <option value={opt.value}>{opt.label}</option>
  {/each}
</select>
