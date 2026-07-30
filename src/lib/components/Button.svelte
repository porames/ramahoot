<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    children,
    onclick,
    disabled = false,
    variant = 'primary',
    type = 'button',
    class: className = ''
  }: {
    children: Snippet;
    onclick?: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'dashed' | 'danger';
    type?: 'button' | 'submit';
    class?: string;
  } = $props();
</script>

<button
  {onclick}
  {disabled}
  {type}
  class="font-black uppercase tracking-wide transition-all disabled:opacity-50 {variant === 'primary' ? 'w-full py-3 border-[3px] border-black rounded-lg bg-[#FFD23F] text-black text-base shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5' : variant === 'dashed' ? 'border-[3px] border-black rounded-lg bg-[#4D7CFE] px-4 py-2 text-xs text-white shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5' : 'border-[3px] border-black rounded-lg bg-[#E53E3E] px-3 py-1 text-xs text-white shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5'} {className}"
>
  {@render children()}
</button>
