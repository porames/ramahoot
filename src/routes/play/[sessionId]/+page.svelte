<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import {
    doc,
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    getDocs,
    getDoc,
    serverTimestamp,
    type Timestamp,
    type Unsubscribe
  } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import type { Session, Quiz, Question, Player, Answer, AvatarConfig } from '$lib/types';
  import AvatarCreator from '$lib/AvatarCreator.svelte';

  const sessionId = $page.params.sessionId!;

  let session = $state<Session | null>(null);
  let quiz = $state<Quiz | null>(null);
  let question = $state<Question | null>(null);
  let countdown = $state<number | null>(null);
  let drift = $state(browser ? Number(localStorage.getItem('drift') ?? '0') : 0);
  let localTimer: number | null = null;
  let playerId = $state('');
  let playerName = $state('');
  let score = $state(0);
  let answerId = $state<string | null>(null);

  let selectedOptionId = $state<string | null>(null);
  let submitted = $state(false);
  let isCorrect = $state(false);
  let pointsEarned = $state(0);
  let loading = $state(true);
  let error = $state('');
  let screen = $state<'waiting' | 'active' | 'answered' | 'finished'>('waiting');
  let previewMode = $state(false);
  let avatarConfig = $state<AvatarConfig | null>(null);

  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    if (!avatarConfig || !playerId || !sessionId) return;
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      updateDoc(doc(db, 'sessions', sessionId, 'players', playerId), { avatarConfig });
      saveTimeout = null;
    }, 1500);
  });

  let sessionUnsub: Unsubscribe | null = null;
  let answersUnsub: Unsubscribe | null = null;

  onMount(async () => {
    try {
      playerId = localStorage.getItem('playerId') ?? '';

      if (!sessionId || !playerId) {
        error = 'Session not found. Please join again.';
        loading = false;
        return;
      }

      const playerSnap = await getDoc(doc(db, 'sessions', sessionId, 'players', playerId));
      if (!playerSnap.exists()) {
        error = 'Player not found. Please join again.';
        loading = false;
        return;
      }
      const playerData = playerSnap.data();
      playerName = playerData.playerName ?? '';
      const saved = playerData.avatarConfig as AvatarConfig | undefined;
      if (saved) avatarConfig = saved;
      //const q = query(collection(db, 'sessions'), where('code', '==', code));
      const sessionSnap = await getDoc(doc(db, 'sessions', sessionId));
      if (!sessionSnap.exists()) {
        error = 'Session not found';
        loading = false;
        return;
      }

      const sessionData = { id: sessionSnap.id, ...sessionSnap.data() } as Session;
      session = sessionData;
      console.log(drift);
      const quizDoc = await getDoc(doc(db, 'quizzes', sessionData.quizId));
      if (!quizDoc.exists()) {
        error = 'Quiz not found';
        loading = false;
        return;
      }
      quiz = { id: quizDoc.id, ...quizDoc.data() } as Quiz;

      if (sessionData.status === 'active' && sessionData.liveQuestion) {
        question = sessionData.liveQuestion;
        screen = 'active';
        await checkAlreadyAnswered(sessionData.liveQuestion.id);
        if (sessionData.questionStartedAt) {
          previewMode = false;
          startLocalCountdown(sessionData.questionStartedAt, sessionData.liveQuestion.timeLimit);
        } else if (sessionData.previewStartedAt) {
          previewMode = true;
          startPreviewCountdown(sessionData.previewStartedAt, 5);
        }
      }

      function startPreviewCountdown(previewStartedAt: Timestamp, previewSeconds: number) {
        clearInterval(localTimer!);
        const tick = () => {
          const serverNow = Date.now() + drift;
          const elapsed = (serverNow - previewStartedAt.toMillis()) / 1000;
          countdown = Math.max(0, Math.ceil(previewSeconds - elapsed));
          if (countdown === 0) {
            clearInterval(localTimer!);
            localTimer = null;
          }
        };
        tick();
        localTimer = window.setInterval(tick, 200);
      }

      function startLocalCountdown(questionStartedAt: Timestamp, timeLimit: number) {
        clearInterval(localTimer!);
        const tick = () => {
          const serverNow = Date.now() + drift;
          const elapsed = (serverNow - questionStartedAt.toMillis()) / 1000;
          countdown = Math.max(0, Math.ceil(timeLimit - elapsed));
          if (countdown === 0) {
            clearInterval(localTimer!);
            localTimer = null;
            if (!submitted) submitAnswer(null);
          }
        };
        tick();
        localTimer = window.setInterval(tick, 200);
      }

      sessionUnsub = onSnapshot(doc(db, 'sessions', sessionId), (docSnap) => {
        if (!docSnap.exists()) return;
        const sData = { id: docSnap.id, ...docSnap.data() } as Session;
        session = sData;
        loading = false;

        if (sData.status === 'active' && sData.liveQuestion) {
          const qChanged = !question || question.id !== sData.liveQuestion.id;
          question = sData.liveQuestion;
          screen = 'active';
          if (qChanged) {
            submitted = false;
            selectedOptionId = null;
            answerId = null;
            checkAlreadyAnswered(sData.liveQuestion.id);
            if (sData.questionStartedAt) {
              previewMode = false;
              startLocalCountdown(sData.questionStartedAt, sData.liveQuestion.timeLimit);
            } else if (sData.previewStartedAt) {
              previewMode = true;
              startPreviewCountdown(sData.previewStartedAt, 5);
            }
          } else if (previewMode && sData.questionStartedAt) {
            previewMode = false;
            startLocalCountdown(sData.questionStartedAt, sData.liveQuestion.timeLimit);
          }
          if (sData.countdown === 0 && !submitted) {
            submitAnswer(null);
          }
        } else if (sData.status === 'finished') {
          screen = 'finished';
          fetchFinalScore();
        } else if (sData.status === 'waiting') {
          screen = 'waiting';
        }
      });
    } catch (err) {
      console.log(err);
    }
  });

  onDestroy(() => {
    clearTimeout(saveTimeout!);
    sessionUnsub?.();
    answersUnsub?.();
    clearInterval(localTimer!);
  });

  const totalQuestions = $derived(quiz?.questions?.length ?? 0);
  const currentIndex = $derived(quiz?.questions?.findIndex((q) => q.id === question?.id) ?? 0);

  function listenForAnswers() {
    if (!answerId) return;
    answersUnsub?.();
    answersUnsub = onSnapshot(doc(db, 'sessions', sessionId, 'answers', answerId), (snap) => {
      if (snap.exists()) {
        const ans = snap.data() as Answer;
        if (ans.isCorrect !== undefined) isCorrect = ans.isCorrect;
        pointsEarned = ans.pointsEarned;
      }
    });
  }

  async function checkAlreadyAnswered(questionId: string) {
    const snap = await getDocs(
      query(
        collection(db, 'sessions', sessionId, 'answers'),
        where('questionId', '==', questionId),
        where('playerId', '==', playerId)
      )
    );
    if (!snap.empty) {
      const ans = snap.docs[0].data() as Answer;
      console.log(snap.docs[0].data());
      answerId = snap.docs[0].id;
      submitted = true;
      selectedOptionId = ans.chosenAnswerId;
      if (ans.isCorrect !== undefined) isCorrect = ans.isCorrect;
      listenForAnswers();
    }
  }

  async function submitAnswer(optionId: string | null) {
    if (submitted || !session || !question || !playerId || !sessionId) return;

    submitted = true;
    selectedOptionId = optionId;

    const ansRef = await addDoc(collection(db, 'sessions', sessionId, 'answers'), {
      playerId,
      questionId: question.id,
      chosenAnswerId: optionId,
      playerName,
      answeredAt: serverTimestamp()
    });
    answerId = ansRef.id;
    listenForAnswers();
  }

  async function fetchFinalScore() {
    if (!playerId || !sessionId) return;
    const unsub = onSnapshot(doc(db, 'sessions', sessionId, 'players', playerId), (snap) => {
      if (snap.exists()) {
        score = snap.data().score;
      }
    });
    setTimeout(() => unsub(), 3000);
  }

  function getCorrectAnswerText(): string {
    if (!question) return '';
    const q = question;
    return q.options.find((o) => o.id === q.correctAnswerId)?.value ?? '';
  }
</script>

<div class="min-h-screen flex items-center justify-center p-4">
  <div class="w-full max-w-lg rounded-2xl bg-white shadow-lg p-6">
    {#if loading}
      <div class="text-center">
        <p class="text-slate-500 text-lg">Loading…</p>
      </div>
    {:else if error}
      <div class="text-center">
        <p class="text-red-500 text-lg">{error}</p>
        <a href="/join" class="text-indigo-600 mt-4 inline-block hover:underline">Try again</a>
      </div>
    {:else if screen === 'waiting'}
      <div class="text-center">
        <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
          <div class="text-5xl mb-4">&#x1F3AF;</div>
          <h1 class="text-2xl font-bold text-slate-900 mb-2">You're in!</h1>
          <p class="text-slate-500">Waiting for the teacher to start the quiz…</p>
          <AvatarCreator onConfigChange={(c: AvatarConfig) => (avatarConfig = c)} savedConfig={avatarConfig} />
        </div>
      </div>
    {:else if screen === 'active' && question && countdown !== null}
      <div>
        <div class="text-center mb-6">
          <div class="text-sm text-slate-500 mb-1">
            Question {currentIndex + 1} of {totalQuestions}
          </div>
          <div class="text-6xl font-mono font-bold text-indigo-600">{countdown}</div>
        </div>

        <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-4">
          <p class="text-xl font-medium text-slate-900">{question.prompt}</p>
        </div>

        {#if !submitted && countdown > 0 && !previewMode}
          <div class="space-y-3">
            {#each question.options as option}
              <button
                onclick={() => submitAnswer(option.id)}
                class="w-full rounded-xl bg-white border border-slate-200 shadow-sm px-6 py-4 text-left text-lg text-slate-800 transition hover:bg-slate-50"
              >
                {option.value}
              </button>
            {/each}
          </div>
        {:else if previewMode}
          <p class="text-center text-slate-500 text-lg">Answers will appear soon...</p>
        {:else if countdown > 0}
          <div class="space-y-3">
            {#each question.options as option}
              <button
                disabled
                class="w-full rounded-xl bg-white border border-slate-200 shadow-sm px-6 py-4 text-left text-lg text-slate-400 cursor-default"
              >
                {option.value}
              </button>
            {/each}
          </div>
          <div class="mt-6 text-center">
            <p class="text-slate-500 text-lg">Answer submitted, waiting for results…</p>
          </div>
        {:else}
          <div class="text-center">
            <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-8 mb-4">
              {#if submitted && isCorrect}
                <div class="text-5xl mb-4">&#x2705;</div>
                <h2 class="text-2xl font-bold text-emerald-600 mb-2">Correct!</h2>
              {:else if submitted && !isCorrect}
                <div class="text-5xl mb-4">&#x274C;</div>
                <h2 class="text-2xl font-bold text-red-500 mb-2">Wrong!</h2>
              {:else}
                <div class="text-5xl mb-4">&#x23F0;</div>
                <h2 class="text-2xl font-bold text-amber-500 mb-2">Time's Up!</h2>
              {/if}
              <p class="text-slate-600">
                Correct answer: <span class="text-emerald-600 font-semibold"
                  >{getCorrectAnswerText()}</span
                >
              </p>
              <p class="text-slate-600">
                You earned: <span class="text-emerald-600 font-semibold">{pointsEarned}</span>
              </p>
            </div>
            <p class="text-slate-500">Waiting for the next question…</p>
          </div>
        {/if}
      </div>
    {:else if screen === 'finished'}
      <div class="text-center">
        <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
          <div class="text-5xl mb-4">&#x1F3C6;</div>
          <h2 class="text-2xl font-bold text-slate-900 mb-4">Quiz Complete!</h2>
          <div class="text-5xl font-bold text-indigo-600 mb-2">{score}</div>
          <p class="text-slate-500">points earned</p>
        </div>
        <a href="/play" class="inline-block mt-6 text-indigo-600 hover:underline"
          >Join another quiz</a
        >
      </div>
    {/if}
  </div>
</div>
