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

<div class="min-h-screen p-4 bg-[#F0E6FF]">
  <div class="mx-auto max-w-3xl">
    <div class="relative bg-[#FFF8E7] border-[4px] border-black rounded-lg p-6">
      <a
        href="/teacher/dashboard"
        class="inline-flex items-center gap-1 border-[3px] border-black rounded-lg bg-[#4D7CFE] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </a>

      {#if loading}
        <div class="space-y-4">
          <div class="h-8 rounded-lg bg-slate-100 animate-pulse border-[3px] border-black"></div>
          <div class="h-64 rounded-lg bg-slate-100 animate-pulse border-[3px] border-black"></div>
        </div>
      {:else if error}
        <div class="border-[3px] border-black rounded-lg bg-red-50 p-6 text-center">
          <p class="text-red-600 font-bold">{error}</p>
          <a href="/teacher/dashboard" class="inline-block mt-2 border-[3px] border-black rounded-lg bg-[#4D7CFE] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all">Go back</a>
        </div>
      {:else}
        <div class="mb-6">
          <h1 class="text-2xl font-black uppercase tracking-tight text-black">{quizTitle}</h1>
          <p class="text-xs font-bold text-black/60 mt-1">{sessionDate} &middot; {players.length} player{players.length !== 1 ? 's' : ''} &middot; {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}</p>
        </div>

        {#if totalQuestions > 0}
          <div class="flex items-center justify-between mb-4">
            <button
              onclick={() => currentIndex = Math.max(0, currentIndex - 1)}
              disabled={currentIndex === 0}
              class="border-[3px] border-black rounded-lg bg-[#4D7CFE] px-4 py-2 text-xs font-black uppercase tracking-wide text-white shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="text-xs font-black text-black uppercase tracking-wide">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <button
              onclick={() => currentIndex = Math.min(totalQuestions - 1, currentIndex + 1)}
              disabled={currentIndex === totalQuestions - 1}
              class="border-[3px] border-black rounded-lg bg-[#4D7CFE] px-4 py-2 text-xs font-black uppercase tracking-wide text-white shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>

          <div class="border-[3px] border-black rounded-lg bg-[#F0F4FF] p-6 mb-4">
            <div class="flex items-start justify-between mb-3">
              <p class="text-lg font-black text-black flex-1 uppercase tracking-tight">{currentQuestion?.prompt}</p>
              <span class="shrink-0 ml-3 border-[2px] border-black rounded-md bg-white px-2 py-0.5 text-xs font-black text-black uppercase">{currentQuestion?.type}</span>
            </div>

            {#if isScorable}
              <div class="text-xs font-bold text-black/60 mb-4">
                Correct answer: <span class="text-[#17C964] font-black">{correctAnswerText}</span>
              </div>
            {:else if currentQuestion?.type === 'poll'}
              <p class="text-xs font-bold text-black/60 mb-4 uppercase">Poll results</p>
            {:else}
              <p class="text-xs font-bold text-black/60 mb-4 uppercase">Responses ({answersForQuestion.length})</p>
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
            <div class="border-[3px] border-black rounded-lg bg-[#F0F4FF] p-6 mb-4">
              <WordCloud words={getTextResponses()} />
            </div>
          {:else}
            <div class="border-[3px] border-black rounded-lg bg-[#F0F4FF] p-6 mb-4">
              <h3 class="text-xs font-black text-black uppercase mb-3">Responses ({answersForQuestion.length})</h3>
              {#if getTextResponses().length > 0}
                <div class="max-h-48 overflow-y-auto space-y-1">
                  {#each getTextResponses() as response}
                    <div class="border-[2px] border-black rounded-md bg-white px-4 py-2 text-sm font-bold text-black">{response}</div>
                  {/each}
                </div>
              {:else}
                <p class="text-xs font-bold text-black/40">No responses</p>
              {/if}
            </div>
          {/if}

          <div class="border-[3px] border-black rounded-lg bg-[#F0F4FF] p-6 mb-4">
            <h3 class="text-xs font-black text-black uppercase mb-3">Player Answers ({answersForQuestion.length})</h3>
            {#if answersForQuestion.length > 0}
              <div class="space-y-2">
                {#each answersForQuestion as answer}
                  {@const player = players.find((p) => p.id === answer.playerId)}
                  <div class="flex items-center justify-between border-[2px] border-black rounded-lg bg-white px-4 py-2.5">
                    <div class="flex items-center gap-3 min-w-0">
                      {#if player?.avatarConfig}
                        <div class="w-8 h-8 shrink-0">
                          <Avatar showBackground={false} {...player.avatarConfig} gradSuffix={player.id} />
                        </div>
                      {:else}
                        <div class="w-8 h-8 border-[2px] border-black rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                          <span class="text-xs font-black text-black">{answer.playerName[0]?.toUpperCase()}</span>
                        </div>
                      {/if}
                      <span class="text-sm font-bold text-black truncate">{answer.playerName}</span>
                    </div>
                    <div class="flex items-center gap-3 shrink-0 ml-3">
                      <span class="text-xs font-bold text-black/60">
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
                          class="text-xs font-black px-2 py-0.5 rounded border-[2px] border-black {answer.isCorrect ? 'bg-[#17C964] text-black' : 'bg-[#FF5FA2] text-white'}"
                        >
                          {answer.isCorrect ? '+' : ''}{answer.pointsEarned}
                        </span>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="text-xs font-bold text-black/40">No answers for this question</p>
            {/if}
          </div>
        {/if}

        <div class="border-[3px] border-black rounded-lg bg-[#F0FFF4] p-6">
          <h3 class="text-xs font-black text-black uppercase mb-4">Final Leaderboard</h3>
          <div class="space-y-2">
            {#each leaderboard as entry}
              {@const isTop3 = entry.rank <= 3}
              <div class="flex items-center justify-between border-[3px] border-black rounded-lg px-4 py-3 {isTop3 ? 'bg-[#FFD23F]' : 'bg-white'}">
                <div class="flex items-center gap-3">
                  <span class="text-sm font-black w-6 {isTop3 ? 'text-black' : 'text-black/40'}">#{entry.rank}</span>
                  {#if entry.avatarConfig}
                    <div class="w-10 h-10">
                      <Avatar showBackground={false} {...entry.avatarConfig} gradSuffix={entry.id} />
                    </div>
                  {/if}
                  <span class="text-sm font-bold text-black">{entry.playerName}</span>
                </div>
                <span class="font-black text-black">{entry.score} pts</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>