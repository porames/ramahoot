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
    <div class="text-sm text-slate-500 mb-1">
      Question {currentIndex + 1} of {totalQuestions}
    </div>
    {#if countdownActive}
      <div class="text-6xl font-mono font-bold text-indigo-600">{countdown}</div>
    {/if}
  </div>

  <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-4">
    <p class="text-xl font-medium text-slate-900">{question.prompt}</p>
  </div>
  <!-- in active mode. countdown is running. waiting for user to submit. -->
  {#if !submitted && !previewMode && (countdownActive || noTimeLimit)}
    <!-- question type uses choice options selection -->
    {#if hasOptions}
      <div class="space-y-3">
        {#each questionOptions as option}
          <button
            onclick={() => onsubmit(option.id)}
            class="w-full rounded-xl bg-white border border-slate-200 shadow-sm px-6 py-4 text-left text-lg text-slate-800 transition hover:bg-slate-50"
          >
            {option.value}
          </button>
        {/each}
      </div>

      <!-- question type uses text input to answer -->
    {:else if question.type === 'type' || question.type === 'wordCloud' || question.type === 'openEnded'}
      <div class="flex gap-2">
        <input
          bind:value={textAnswer}
          type="text"
          placeholder="Type your answer…"
          class="flex-1 rounded-xl bg-white border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          onclick={onsubmittext}
          disabled={!textAnswer.trim()}
          class="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    {/if}

    <!-- waiting 5 sec before showing answers -->
  {:else if previewMode}
    <p class="text-center text-slate-500 text-lg">Answers will appear soon...</p>

    <!-- handles when user refresh middle of session, user already submitted -->
  {:else if countdownActive}
    {#if hasOptions}
      <div class="space-y-3">
        {#each questionOptions as option}
          <button
            disabled
            class="w-full rounded-xl bg-white border border-slate-200 shadow-sm px-6 py-4 text-left text-lg text-slate-400 cursor-default"
          >
            {option.value}
          </button>
        {/each}
      </div>
    {/if}
    <div class="mt-6 text-center">
      <p class="text-slate-500 text-lg">Answer submitted, waiting for results…</p>
    </div>
    <!-- countdown finished -->
  {:else}
    <div class="text-center">
      <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-8 mb-4">
        {#if isScorableType && submitted && !scored}
          <!-- loading while teacher grades -->
          <div class="flex flex-col items-center">
            <svg class="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <h2 class="text-2xl font-bold text-slate-900 mb-2">Grading your answer…</h2>
            <p class="text-slate-600">Waiting for your score</p>
          </div>
        {:else if question.type === 'poll' || question.type === 'wordCloud' || question.type === 'openEnded'}
          <div class="text-5xl mb-4">&#x2705;</div>
          <h2 class="text-2xl font-bold text-emerald-600 mb-2">Answered!</h2>
          <p class="text-slate-600">Your response has been recorded</p>
        {:else if submitted && isCorrect}
          <div class="text-5xl mb-4">&#x2705;</div>
          <h2 class="text-2xl font-bold text-emerald-600 mb-2">Correct!</h2>
        {:else if submitted && !isCorrect}
          <div class="text-5xl mb-4">&#x274C;</div>
          <h2 class="text-2xl font-bold text-red-500 mb-2">Wrong!</h2>
        {:else}
          <div class="text-5xl mb-4">&#x23F0;</div>
          <h2 class="text-2xl font-bold text-amber-500 mb-2">Time's Up!</h2>
        {/if}
        {#if !(isScorableType && submitted && !scored)}
          {#if getCorrectAnswerText()}
            <p class="text-slate-600">
              Correct answer: <span class="text-emerald-600 font-semibold"
                >{getCorrectAnswerText()}</span
              >
            </p>
          {/if}
          {#if question.type !== 'poll' && question.type !== 'wordCloud' && question.type !== 'openEnded'}
            <p class="text-slate-600">
              You earned: <span class="text-emerald-600 font-semibold">{pointsEarned}</span>
            </p>
          {/if}
        {/if}
      </div>
      <p class="text-slate-500">Waiting for the next question…</p>
    </div>
  {/if}
</div>
