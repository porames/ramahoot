<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { collection, getDocs } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { initializeSession } from '$lib/utils/dashboard/initializeSession';
  import type { Question, Player, Answer } from '$lib/types';
  import BarChart, { type ChartDatum } from '$lib/components/BarChart.svelte';
  import WordCloud from '$lib/components/WordCloud.svelte';
  import Avatar from '$lib/avatar/Avatar.svelte';
  import moment from 'moment';

  let sessionId = $derived($page.params.sessionId ?? '');

  let loading = $state(true);
  let error = $state('');
  let questions = $state<Question[]>([]);
  let players = $state<Player[]>([]);
  let answers = $state<Answer[]>([]);
  let quizTitle = $state('');
  let sessionDate = $state('');

  let currentIndex = $state(0);
  let currentQuestion = $derived(questions[currentIndex]);
  let totalQuestions = $derived(questions.length);

  let answersForQuestion = $derived(
    answers.filter((a) => a.questionId === currentQuestion?.id)
  );

  let leaderboard = $derived(
    [...players].sort((a, b) => b.score - a.score).map((s, i) => ({ ...s, rank: i + 1 }))
  );

  let hasOptions = $derived(
    currentQuestion ? 'options' in currentQuestion && currentQuestion.options.length > 0 : false
  );

  let isScorable = $derived(
    currentQuestion?.type === 'quiz' || currentQuestion?.type === 'tf' || currentQuestion?.type === 'type'
  );

  let correctAnswerText = $derived.by(() => {
    if (!currentQuestion) return '';
    if (currentQuestion.type === 'type') return currentQuestion.correctAnswer;
    if ('options' in currentQuestion && 'correctAnswerId' in currentQuestion) {
      return currentQuestion.options.find((o) => o.id === currentQuestion.correctAnswerId)?.value ?? '';
    }
    return '';
  });

  function getOptionStats(): ChartDatum[] {
    if (!hasOptions || !currentQuestion || !('options' in currentQuestion)) return [];
    return currentQuestion.options.map((opt) => {
      const count = answersForQuestion.filter((a) => a.chosenAnswerId === opt.id).length;
      return { label: opt.value, value: count };
    });
  }

  function getTextResponses(): string[] {
    return answersForQuestion
      .filter((a) => a.typedAnswer != null && a.typedAnswer !== '')
      .map((a) => a.typedAnswer!);
  }

  onMount(async () => {
    if (!sessionId) { error = 'Session not found'; loading = false; return; }
    try {
      const result = await initializeSession(db, sessionId);
      if (!result.session || !result.quiz) {
        error = result.error || 'Session not found';
        loading = false;
        return;
      }

      quizTitle = result.quiz.title;
      sessionDate = result.session.startedAt
        ? moment(result.session.startedAt.toMillis()).format('DD MMM YYYY, h:mm A')
        : 'Unknown date';
      questions = result.questions;

      const [playersSnap, answersSnap] = await Promise.all([
        getDocs(collection(db, 'sessions', sessionId, 'players')),
        getDocs(collection(db, 'sessions', sessionId, 'answers'))
      ]);

      players = playersSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Player);
      answers = answersSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Answer);
    } catch (e) {
      console.error('Failed to load session review', e);
      error = 'Failed to load session data';
    } finally {
      loading = false;
    }
  });
</script>

<div class="min-h-screen p-4">
  <div class="mx-auto max-w-3xl">
    <div class="rounded-2xl bg-white shadow-lg p-6">
      <a
        href="/teacher/dashboard"
        class="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Dashboard
      </a>

      {#if loading}
        <div class="space-y-4">
          <div class="h-8 rounded-xl bg-slate-100 animate-pulse"></div>
          <div class="h-64 rounded-2xl bg-slate-100 animate-pulse"></div>
        </div>
      {:else if error}
        <div class="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
          <p class="text-red-600 font-semibold">{error}</p>
          <a href="/teacher/dashboard" class="text-sm text-red-500 underline mt-2 inline-block">Go back</a>
        </div>
      {:else}
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-slate-900">{quizTitle}</h1>
          <p class="text-sm text-slate-500 mt-1">{sessionDate} &middot; {players.length} player{players.length !== 1 ? 's' : ''} &middot; {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}</p>
        </div>

        {#if totalQuestions > 0}
          <div class="flex items-center justify-between mb-4">
            <button
              onclick={() => currentIndex = Math.max(0, currentIndex - 1)}
              disabled={currentIndex === 0}
              class="rounded-xl bg-white border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="text-sm font-semibold text-slate-600">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <button
              onclick={() => currentIndex = Math.min(totalQuestions - 1, currentIndex + 1)}
              disabled={currentIndex === totalQuestions - 1}
              class="rounded-xl bg-white border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>

          <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-4">
            <div class="flex items-start justify-between mb-3">
              <p class="text-lg font-medium text-slate-900 flex-1">{currentQuestion?.prompt}</p>
              <span class="shrink-0 ml-3 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 uppercase">{currentQuestion?.type}</span>
            </div>

            {#if isScorable}
              <div class="text-sm text-slate-500 mb-4">
                Correct answer: <span class="text-emerald-600 font-semibold">{correctAnswerText}</span>
              </div>
            {:else if currentQuestion?.type === 'poll'}
              <p class="text-sm text-slate-500 mb-4">Poll results</p>
            {:else}
              <p class="text-sm text-slate-500 mb-4">Responses ({answersForQuestion.length})</p>
            {/if}
          </div>

          {#if hasOptions}
            <div class="mb-4">
              <BarChart
                title="Results"
                subtitle="{answersForQuestion.length} answered"
                data={getOptionStats()}
              />
            </div>
          {:else if currentQuestion?.type === 'wordCloud'}
            <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-4">
              <WordCloud words={getTextResponses()} />
            </div>
          {:else}
            <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-4">
              <h3 class="text-sm font-medium text-slate-500 mb-3">Responses ({answersForQuestion.length})</h3>
              {#if getTextResponses().length > 0}
                <div class="max-h-48 overflow-y-auto space-y-1">
                  {#each getTextResponses() as response}
                    <div class="rounded-lg bg-slate-50 px-4 py-2 text-sm text-slate-700">{response}</div>
                  {/each}
                </div>
              {:else}
                <p class="text-sm text-slate-400">No responses</p>
              {/if}
            </div>
          {/if}

          <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-4">
            <h3 class="text-sm font-medium text-slate-500 mb-3">Player Answers ({answersForQuestion.length})</h3>
            {#if answersForQuestion.length > 0}
              <div class="space-y-2">
                {#each answersForQuestion as answer}
                  {@const player = players.find((p) => p.id === answer.playerId)}
                  <div class="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                    <div class="flex items-center gap-3 min-w-0">
                      {#if player?.avatarConfig}
                        <div class="w-8 h-8 shrink-0">
                          <Avatar showBackground={false} {...player.avatarConfig} gradSuffix={player.id} />
                        </div>
                      {:else}
                        <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                          <span class="text-xs font-bold text-slate-500">{answer.playerName[0]?.toUpperCase()}</span>
                        </div>
                      {/if}
                      <span class="text-sm font-medium text-slate-700 truncate">{answer.playerName}</span>
                    </div>
                    <div class="flex items-center gap-3 shrink-0 ml-3">
                      <span class="text-sm text-slate-600">
                        {#if hasOptions}
                          {currentQuestion && 'options' in currentQuestion
                            ? currentQuestion.options.find((o) => o.id === answer.chosenAnswerId)?.value || '—'
                            : '—'}
                        {:else}
                          {answer.typedAnswer || '—'}
                        {/if}
                      </span>
                      {#if isScorable}
                        <span
                          class="text-xs font-bold px-2 py-0.5 rounded {answer.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}"
                        >
                          {answer.isCorrect ? '+' : ''}{answer.pointsEarned}
                        </span>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="text-sm text-slate-400">No answers for this question</p>
            {/if}
          </div>
        {/if}

        <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <h3 class="text-sm font-medium text-slate-500 mb-4">Final Leaderboard</h3>
          <div class="space-y-2">
            {#each leaderboard as entry}
              {@const isTop3 = entry.rank <= 3}
              <div class="flex items-center justify-between rounded-xl px-4 py-3 {isTop3 ? 'bg-indigo-50' : ''}">
                <div class="flex items-center gap-3">
                  <span class="text-sm font-bold w-6 {isTop3 ? 'text-amber-500' : 'text-slate-400'}">#{entry.rank}</span>
                  {#if entry.avatarConfig}
                    <div class="w-10 h-10">
                      <Avatar showBackground={false} {...entry.avatarConfig} gradSuffix={entry.id} />
                    </div>
                  {/if}
                  <span class="text-slate-800">{entry.playerName}</span>
                </div>
                <span class="font-mono font-bold text-indigo-600">{entry.score} pts</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>