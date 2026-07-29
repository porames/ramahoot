<script lang="ts">
  import ListChecks from '@lucide/svelte/icons/list-checks';
  import ToggleLeft from '@lucide/svelte/icons/toggle-left';
  import TextCursorInput from '@lucide/svelte/icons/text-cursor-input';
  import Vote from '@lucide/svelte/icons/vote';
  import Cloud from '@lucide/svelte/icons/cloud';
  import PenLine from '@lucide/svelte/icons/pen-line';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import { clickOutside } from '$lib/utils/click-outside';
  import type { Component } from 'svelte';
  import type { QuestionType } from '$lib/types';

  let {
    value = $bindable('quiz' as QuestionType),
    onchange,
    class: className = ''
  }: {
    value: QuestionType;
    onchange?: (newType: QuestionType) => void;
    class?: string;
  } = $props();

  let show = $state(false);

  const types: { id: QuestionType; label: string; icon: Component; desc: string }[] = [
    { id: 'quiz', label: 'Multiple Choice', icon: ListChecks, desc: 'Pick the correct answer' },
    { id: 'tf', label: 'True / False', icon: ToggleLeft, desc: 'True or false statement' },
    { id: 'type', label: 'Typing', icon: TextCursorInput, desc: 'Type the correct answer' },
    { id: 'poll', label: 'Poll', icon: Vote, desc: 'Vote on options' },
    { id: 'wordCloud', label: 'Word Cloud', icon: Cloud, desc: 'Free word responses' },
    { id: 'openEnded', label: 'Open Ended', icon: PenLine, desc: 'Long text responses' }
  ];

  let selected = $derived(types.find((t) => t.id === value)!);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="relative w-60 {className}" use:clickOutside={() => (show = false)}>
  <span class="block text-sm font-medium text-slate-700 mb-1">Question Type</span>
  <button
    onclick={() => (show = !show)}
    class="flex items-center justify-between w-full rounded-xl bg-white text-indigo-600 border-2 border-indigo-600 px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
  >
    <span class="flex items-center gap-2">
      {#each [selected] as { icon: Icon }}
        <Icon size={16} />
      {/each}
      {selected.label}
    </span>
    <ChevronDown size={16} class="text-slate-400 transition {show ? 'rotate-180' : ''}" />
  </button>

  {#if show}
    <div
      class="absolute z-10 mt-1 w-full rounded-xl bg-white border border-slate-200 shadow-lg py-1"
    >
      {#each types as { id, label, icon: Icon, desc }}
        <button
          onclick={() => {
            value = id;
            show = false;
            onchange?.(id);
          }}
          class="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition"
          class:bg-indigo-50={value === id}
          class:text-indigo-700={value === id}
          class:text-slate-700={value !== id}
          class:hover:bg-slate-50={value !== id}
        >
          <Icon size={18} class={value === id ? 'stroke-indigo-600' : 'stroke-slate-500'} />
          <div>
            <div class="font-medium">{label}</div>
            <div class="text-xs text-slate-400">{desc}</div>
          </div>
        </button>
        {#if id === 'quiz'}
          <div class="mx-3 border-t border-slate-100 my-1"></div>
        {/if}
      {/each}
    </div>
  {/if}
</div>
