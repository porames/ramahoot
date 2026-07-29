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
  class="rounded-xl font-semibold transition disabled:opacity-50 {className}"
  class:w-full={variant !== 'danger'}
  class:py-3={variant !== 'danger'}
  class:bg-indigo-600={variant === 'primary'}
  class:text-white={variant === 'primary'}
  class:text-lg={variant === 'primary'}
  class:hover:bg-indigo-700={variant === 'primary'}
  class:border-2={variant === 'dashed'}
  class:border-dashed={variant === 'dashed'}
  class:border-slate-300={variant === 'dashed'}
  class:text-slate-400={variant === 'dashed'}
  class:hover:border-slate-400={variant === 'dashed'}
  class:hover:text-slate-500={variant === 'dashed'}
  class:text-red-500={variant === 'danger'}
  class:text-sm={variant === 'danger'}
  class:hover:text-red-600={variant === 'danger'}
>
  {@render children()}
</button>
