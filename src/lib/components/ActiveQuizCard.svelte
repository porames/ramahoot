<script lang="ts">
  import type { Question } from '$lib/types';

  let {
    question,
    countdown,
    countdownActive,
    noTimeLimit,
    previewMode,
    submitted,
    isCorrect,
    pointsEarned,
    scored,
    currentIndex,
    totalQuestions,
    textAnswer = $bindable(''),
    onsubmit,
    onsubmittext,
    getCorrectAnswerText
  }: {
    question: Question;
    countdown: number;
    countdownActive: boolean;
    noTimeLimit: boolean;
    previewMode: boolean;
    submitted: boolean;
    isCorrect: boolean;
    pointsEarned: number;
    scored: boolean;
    currentIndex: number;
    totalQuestions: number;
    textAnswer: string;
    onsubmit: (value: string | null) => void;
    onsubmittext: () => void;
    getCorrectAnswerText: () => string;
  } = $props();

  let questionOptions = $derived<{ id: string; value: string }[]>(
    'options' in question ? question.options : []
  );
  let hasOptions = $derived(questionOptions.length > 0);
  let isScorableType = $derived(question.type === 'quiz' || question.type === 'tf' || question.type === 'type');
</script>

<div>
  <div class="text-center mb-6">
    <div class="text-xs font-bold text-black/50 mb-1">
      Question {currentIndex + 1} of {totalQuestions}
    </div>
    {#if countdownActive}
      <div class="text-6xl font-black text-black">{countdown}</div>
    {/if}
  </div>

  <div class="border-[3px] border-black rounded-lg bg-[#F0F4FF] p-6 mb-4">
    <p class="text-xl font-bold text-black">{question.prompt}</p>
  </div>

  {#if !submitted && !previewMode && (countdownActive || noTimeLimit)}
    {#if hasOptions}
      <div class="space-y-3">
        {#each questionOptions as option}
          <button
            onclick={() => onsubmit(option.id)}
            class="w-full border-[3px] border-black rounded-lg bg-white px-6 py-4 text-left text-lg font-bold text-black transition-all hover:shadow-[3px_3px_0px_0px_#111] hover:-translate-y-0.5"
          >
            {option.value}
          </button>
        {/each}
      </div>
    {:else if question.type === 'type' || question.type === 'wordCloud' || question.type === 'openEnded'}
      <div class="flex gap-2">
        <input
          bind:value={textAnswer}
          type="text"
          placeholder="Type your answer…"
          class="flex-1 border-[3px] border-black rounded-lg bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:shadow-[3px_3px_0px_0px_#111] transition-shadow"
        />
        <button
          onclick={onsubmittext}
          disabled={!textAnswer.trim()}
          class="border-[3px] border-black rounded-lg bg-[#17C964] px-6 py-3 font-black uppercase tracking-wide text-black shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all disabled:opacity-40"
        >
          Submit
        </button>
      </div>
    {/if}

  {:else if previewMode}
    <p class="text-center text-sm font-bold text-black/50">Answers will appear soon...</p>

  {:else if countdownActive}
    {#if hasOptions}
      <div class="space-y-3">
        {#each questionOptions as option}
          <button
            disabled
            class="w-full border-[3px] border-black rounded-lg bg-white/60 px-6 py-4 text-left text-lg font-bold text-black/40 cursor-default"
          >
            {option.value}
          </button>
        {/each}
      </div>
    {/if}
    <div class="mt-6 text-center">
      <p class="text-sm font-bold text-black/50">Answer submitted, waiting for results...</p>
    </div>
  {:else}
    <div class="text-center">
      <div class="border-[3px] border-black rounded-lg bg-[#F0FFF4] p-8 mb-4">
        {#if isScorableType && submitted && !scored}
          <div class="flex flex-col items-center">
            <svg class="animate-spin h-10 w-10 text-black mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <h2 class="text-2xl font-bold text-black mb-2">Grading your answer...</h2>
            <p class="text-xs font-bold text-black/60">Waiting for your score</p>
          </div>
        {:else if question.type === 'poll' || question.type === 'wordCloud' || question.type === 'openEnded'}
          <div class="text-5xl mb-4">&#x2705;</div>
          <h2 class="text-2xl font-bold text-[#17C964] mb-2">Answered!</h2>
          <p class="text-xs font-bold text-black/60">Your response has been recorded</p>
        {:else if submitted && isCorrect}
          <div class="text-5xl mb-4">&#x2705;</div>
          <h2 class="text-2xl font-black uppercase tracking-tight text-[#17C964] mb-2">Correct!</h2>
        {:else if submitted && !isCorrect}
          <div class="text-5xl mb-4">&#x274C;</div>
          <h2 class="text-2xl font-black uppercase tracking-tight text-[#FF5FA2] mb-2">Wrong!</h2>
        {:else}
          <div class="text-5xl mb-4">&#x23F0;</div>
          <h2 class="text-2xl font-black uppercase tracking-tight text-black mb-2">Time's Up!</h2>
        {/if}
        {#if !(isScorableType && submitted && !scored)}
          {#if getCorrectAnswerText()}
            <p class="text-xs font-bold text-black/60">
              Correct answer: <span class="text-[#17C964] font-black">{getCorrectAnswerText()}</span>
            </p>
          {/if}
          {#if question.type !== 'poll' && question.type !== 'wordCloud' && question.type !== 'openEnded'}
            <p class="text-xs font-bold text-black/60 mt-1">
              You earned: <span class="text-black font-black">{pointsEarned}</span>
            </p>
          {/if}
        {/if}
      </div>
      <p class="text-xs font-bold text-black/50 uppercase">Waiting for the next question...</p>
    </div>
  {/if}
</div>