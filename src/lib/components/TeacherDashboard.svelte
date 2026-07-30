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
    <h1 class="text-xl font-bold text-black">{quizTitle}</h1>
    <span class="text-xs font-bold text-black/50">
      Question {currentIndex + 1} of {totalQuestions}
    </span>
  </div>

  {#if countdown > 0 || questionPhase === 'preview'}
    <div class="text-center mb-6">
      <div class="text-6xl font-black text-black">{countdown}</div>
      {#if questionPhase === 'preview'}
        <p class="text-xs font-bold text-black/50 mt-2">Get ready...</p>
      {/if}
    </div>

    <div class="border-[3px] border-black rounded-lg bg-[#F0F4FF] p-6 mb-6">
      <p class="text-xl font-bold text-black mb-6">{liveQuestion.prompt}</p>
      {#if questionPhase !== 'preview' && hasOptions}
        <div class="space-y-3">
          {#each liveQuestionOptions as option}
            <div class="border-[3px] border-black rounded-lg bg-white px-6 py-4 text-lg font-bold text-black">
              {option.value}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {:else if questionPhase === 'active' && (liveQuestion.type === 'poll' || liveQuestion.type === 'wordCloud' || liveQuestion.type === 'openEnded')}
    <div class="border-[3px] border-black rounded-lg bg-[#F0F4FF] p-6 mb-6">
      <p class="text-lg font-bold text-black mb-4">{liveQuestion.prompt}</p>
      {#if liveQuestion.type === 'poll'}
        <p class="text-xs font-bold text-black/60">Poll results (live)</p>
      {:else}
        <p class="text-xs font-bold text-black/60">Responses ({answersForCurrentQuestion.length})</p>
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
        <div class="border-[3px] border-black rounded-lg bg-[#F0F4FF] p-6 mb-6">
          <WordCloud words={getTextResponses()} />
        </div>
      {:else}
        <div class="border-[3px] border-black rounded-lg bg-[#F0F4FF] p-6 mb-6">
          <div class="max-h-48 overflow-y-auto space-y-1">
            {#each getTextResponses() as response}
              <div class="border-[2px] border-black rounded-md bg-white px-4 py-2 text-sm font-bold text-black">{response}</div>
            {/each}
            {#if getTextResponses().length === 0}
              <p class="text-xs font-bold text-black/40">No responses yet</p>
            {/if}
          </div>
        </div>
      {/if}
    {/if}

    <button
      onclick={onfinish}
      disabled={acting}
      class="w-full border-[3px] border-black rounded-lg bg-[#FF5FA2] py-3 font-black uppercase tracking-wide text-white text-sm shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all disabled:opacity-40"
    >
      Finish
    </button>
  {:else if questionPhase == 'finished'}
    <div class="border-[3px] border-black rounded-lg bg-[#F0F4FF] p-6 mb-6">
      <p class="text-lg font-bold text-black mb-4">{liveQuestion.prompt}</p>
      {#if isScorable}
        <div class="text-xs font-bold text-black/60">
          Correct: <span class="text-[#17C964] font-black">{correctAnswerText}</span>
        </div>
      {:else if liveQuestion.type === 'poll'}
        <p class="text-xs font-bold text-black/60">Poll results</p>
      {:else if liveQuestion.type === 'wordCloud' || liveQuestion.type === 'openEnded'}
        <p class="text-xs font-bold text-black/60">Responses ({answersForCurrentQuestion.length})</p>
      {/if}
    </div>

    {#if hasOptions}
      <BarChart
        title="Results"
        subtitle="{answersForCurrentQuestion.length} / {players.length} answered"
        data={getOptionStats()}
      />
    {:else}
      {#if liveQuestion.type === 'wordCloud'}
        <div class="border-[3px] border-black rounded-lg bg-[#F0F4FF] p-6 mb-6">
          <WordCloud words={getTextResponses()} />
        </div>
      {:else}
        <div class="border-[3px] border-black rounded-lg bg-[#F0F4FF] p-6 mb-6">
          <div class="max-h-48 overflow-y-auto space-y-1">
            {#each getTextResponses() as response}
              <div class="border-[2px] border-black rounded-md bg-white px-4 py-2 text-sm font-bold text-black">{response}</div>
            {/each}
            {#if getTextResponses().length === 0}
              <p class="text-xs font-bold text-black/40">No responses yet</p>
            {/if}
          </div>
        </div>
      {/if}
    {/if}

    <div class="border-[3px] border-black rounded-lg bg-[#F0FFF4] p-6 mb-6">
      <h3 class="text-xs font-bold text-black mb-4">Leaderboard</h3>
      <div class="space-y-2">
        {#each leaderboard as entry}
          {@const isTop3 = entry.rank <= 3}
          <div class="flex items-center justify-between border-[3px] border-black rounded-lg px-4 py-3 {isTop3 ? 'bg-[#FFD23F]' : 'bg-white'}">
            <div class="flex items-center gap-3">
              <span class="text-sm font-black w-6 {isTop3 ? 'text-black' : 'text-black/40'}"
                >#{entry.rank}</span
              >
              {#if entry.avatarConfig}
                <div class="w-10 h-10">
                  <Avatar showBackground={false} {...entry.avatarConfig} gradSuffix={entry.id} />
                </div>
              {/if}
              <span class="text-sm font-bold text-black">{entry.playerName}</span>
            </div>
            <span class="font-black text-black">{entry.score} pts (+{entry.pointsEarned})</span>
          </div>
        {/each}
      </div>
    </div>

    <div class="flex gap-3">
      <button
        onclick={onnext}
        disabled={acting}
        class="flex-1 border-[3px] border-black rounded-lg bg-[#4D7CFE] py-3 font-black uppercase tracking-wide text-white text-sm shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all disabled:opacity-40"
      >
        {isLastQuestion ? 'End Quiz' : 'Next'}
      </button>

      {#if !isLastQuestion}
        <button
          onclick={onend}
          disabled={acting}
          class="border-[3px] border-black rounded-lg bg-[#FF5FA2] px-6 py-3 font-black uppercase tracking-wide text-white text-sm shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all disabled:opacity-40"
        >
          End Early
        </button>
      {/if}
    </div>
  {/if}
</div>
