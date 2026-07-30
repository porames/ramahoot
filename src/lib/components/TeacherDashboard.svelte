<script lang="ts">
  import Avatar from '$lib/avatar/Avatar.svelte';
  import BarChart, { type ChartDatum } from '$lib/components/BarChart.svelte';
  import WordCloud from '$lib/components/WordCloud.svelte';
  import type { Question, Player, Answer } from '$lib/types';

  let {
    liveQuestion,
    countdown,
    questionPhase,
    currentIndex,
    totalQuestions,
    players,
    answersForCurrentQuestion,
    leaderboard,
    acting,
    quizTitle,
    onnext,
    onend,
    onfinish
  }: {
    liveQuestion: Question;
    countdown: number;
    questionPhase: 'preview' | 'active' | 'finished' | null;
    currentIndex: number;
    totalQuestions: number;
    players: Player[];
    answersForCurrentQuestion: Answer[];
    leaderboard: (Player & { rank: number })[];
    acting: boolean;
    quizTitle: string;
    onnext: () => void;
    onend: () => void;
    onfinish: () => void;
  } = $props();

  let liveQuestionOptions = $derived<{ id: string; value: string }[]>(
    'options' in liveQuestion ? liveQuestion.options : []
  );
  let hasOptions = $derived(liveQuestionOptions.length > 0);
  let isScorable = $derived(
    liveQuestion.type === 'quiz' || liveQuestion.type === 'tf' || liveQuestion.type === 'type'
  );
  let isLastQuestion = $derived(currentIndex + 1 >= totalQuestions);

  let correctAnswerText = $derived.by(() => {
    if (liveQuestion.type === 'type') return liveQuestion.correctAnswer;
    if ('options' in liveQuestion && 'correctAnswerId' in liveQuestion) {
      return liveQuestion.options.find((o) => o.id === liveQuestion.correctAnswerId)?.value ?? '';
    }
    return '';
  });

  function getOptionStats(): ChartDatum[] {
    if (liveQuestionOptions.length === 0) return [];
    return liveQuestionOptions.map((opt) => {
      const count = answersForCurrentQuestion.filter((a) => a.chosenAnswerId === opt.id).length;
      return { label: opt.value, value: count };
    });
  }

  function getTextResponses(): string[] {
    return answersForCurrentQuestion
      .filter((a) => a.typedAnswer != null && a.typedAnswer !== '')
      .map((a) => a.typedAnswer!);
  }
</script>

<div class="mt-8">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-xl font-semibold text-slate-900">{quizTitle}</h1>
    <span class="text-slate-500 text-sm">
      Question {currentIndex + 1} of {totalQuestions}
    </span>
  </div>

  {#if countdown > 0 || questionPhase === 'preview'}
    <div class="text-center mb-6">
      <div class="text-6xl font-mono font-bold text-indigo-600">{countdown}</div>
      {#if questionPhase === 'preview'}
        <p class="text-slate-500 mt-2">Get ready...</p>
      {/if}
    </div>

    <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-6">
      <p class="text-xl font-medium text-slate-900 mb-6">{liveQuestion.prompt}</p>
      {#if questionPhase !== 'preview' && hasOptions}
        <div class="space-y-3">
          {#each liveQuestionOptions as option}
            <div
              class="rounded-xl bg-slate-50 border border-slate-200 px-6 py-4 text-lg text-slate-800"
            >
              {option.value}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {:else if questionPhase === 'active' && (liveQuestion.type === 'poll' || liveQuestion.type === 'wordCloud' || liveQuestion.type === 'openEnded')}
    <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-6">
      <p class="text-lg text-slate-900 mb-4">{liveQuestion.prompt}</p>
      {#if liveQuestion.type === 'poll'}
        <p class="text-sm text-slate-500 mb-2">Poll results (live)</p>
      {:else}
        <p class="text-sm text-slate-500 mb-2">Responses ({answersForCurrentQuestion.length})</p>
      {/if}
    </div>

    {#if hasOptions}
      <BarChart
        title="Poll Results"
        subtitle="{answersForCurrentQuestion.length} / {players.length} live"
        data={getOptionStats()}
      />
    {:else}
      {#if liveQuestion.type === 'wordCloud'}
        <div>
          <WordCloud words={getTextResponses()} />
        </div>
      {:else}
        <div class="max-h-48 overflow-y-auto space-y-1">
          {#each getTextResponses() as response}
            <div class="rounded-lg bg-slate-50 px-4 py-2 text-sm text-slate-700">{response}</div>
          {/each}
          {#if getTextResponses().length === 0}
            <p class="text-slate-400 text-sm">No responses yet</p>
          {/if}
        </div>
      {/if}
    {/if}

    <button
      onclick={onfinish}
      disabled={acting}
      class="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
    >
      Finish
    </button>
  {:else if questionPhase == 'finished'}
    <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-6">
      <p class="text-lg text-slate-900 mb-4">{liveQuestion.prompt}</p>
      {#if isScorable}
        <div class="text-sm text-slate-500 mb-2">
          Correct: <span class="text-emerald-600 font-semibold">{correctAnswerText}</span>
        </div>
      {:else if liveQuestion.type === 'poll'}
        <p class="text-sm text-slate-500">Poll results</p>
      {:else if liveQuestion.type === 'wordCloud' || liveQuestion.type === 'openEnded'}
        <p class="text-sm text-slate-500">Responses ({answersForCurrentQuestion.length})</p>
      {/if}
    </div>

    <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-6">
      <h3 class="text-sm font-medium text-slate-500 mb-4">
        Answers: {answersForCurrentQuestion.length} / {players.length}
      </h3>

      {#if hasOptions}
        <BarChart
          title="Results"
          subtitle="{answersForCurrentQuestion.length} / {players.length} answered"
          data={getOptionStats()}
        />
      {:else}
        {#if liveQuestion.type === 'wordCloud'}
          <div>
            <WordCloud words={getTextResponses()} />
          </div>
        {:else}
          <div class="max-h-48 overflow-y-auto space-y-1">
            {#each getTextResponses() as response}
              <div class="rounded-lg bg-slate-50 px-4 py-2 text-sm text-slate-700">{response}</div>
            {/each}
            {#if getTextResponses().length === 0}
              <p class="text-slate-400 text-sm">No responses yet</p>
            {/if}
          </div>
        {/if}
      {/if}
    </div>

    <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-6">
      <h3 class="text-sm font-medium text-slate-500 mb-4">Leaderboard</h3>
      <div class="space-y-2">
        {#each leaderboard as entry}
          {@const isTop3 = entry.rank <= 3}
          <div
            class="flex items-center justify-between rounded-xl px-4 py-3 {isTop3
              ? 'bg-indigo-50'
              : ''}"
          >
            <div class="flex items-center gap-3">
              <span class="text-sm font-bold w-6 {isTop3 ? 'text-amber-500' : 'text-slate-400'}"
                >#{entry.rank}</span
              >
              {#if entry.avatarConfig}
                <div class="w-10 h-10">
                  <Avatar showBackground={false} {...entry.avatarConfig} gradSuffix={entry.id} />
                </div>
              {/if}
              <span class="text-slate-800">{entry.playerName}</span>
            </div>
            <span class="font-mono font-bold text-indigo-600"
              >{entry.score} pts (+{entry.pointsEarned})</span
            >
          </div>
        {/each}
      </div>
    </div>

    <div class="flex gap-3">
      <button
        onclick={onnext}
        disabled={acting}
        class="flex-1 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {isLastQuestion ? 'End Quiz' : 'Next'}
      </button>

      {#if !isLastQuestion}
        <button
          onclick={onend}
          disabled={acting}
          class="rounded-xl bg-white border border-slate-300 px-6 py-3 font-semibold text-red-500 transition hover:bg-slate-50 disabled:opacity-50"
        >
          End Early
        </button>
      {/if}
    </div>
  {/if}
</div>
