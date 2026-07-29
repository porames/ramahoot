<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import {
    doc,
    collection,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    runTransaction,
    addDoc,
    updateDoc,
    getDocs,
    getDoc,
    type Unsubscribe
  } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { teacher, authReady } from '$lib/stores/auth';
  import type { Quiz, Session, Player, Question, Answer } from '$lib/types';
  import Avatar from '$lib/avatar/Avatar.svelte';
  import SignOutButton from '$lib/SignOutButton.svelte';
  import TeacherDashboard from '$lib/components/TeacherDashboard.svelte';

  const sessionId = $page.params.sessionId!;

  let session = $state<Session | null>(null);
  let quiz = $state<Quiz | null>(null);
  let code = $derived(session?.code ?? '');
  let drift = $state(browser ? Number(localStorage.getItem('teacherDrift') ?? '0') : 0);
  let questions = $state<Question[]>([]);
  let players = $state<Player[]>([]);
  let currentIndex = $state(0);
  let countdown = $state(0);
  let questionPhase = $state<'preview' | 'active' | 'finished' | null>(null);
  let localCountdownStart = $state(0);
  let answersForCurrentQuestion = $state<Answer[]>([]);
  let loading = $state(true);
  let error = $state('');
  let acting = $state(false);

  let interval: number | null = null;
  let sessionUnsub: Unsubscribe | null = null;
  let playersUnsub: Unsubscribe | null = null;
  let answersUnsub: Unsubscribe | null = null;

  let liveQuestion = $derived(session?.liveQuestion);
  let totalQuestions = $derived(questions.length);
  let leaderboard = $derived(
    [...players].sort((a, b) => b.score - a.score).map((s, i) => ({ ...s, rank: i + 1 }))
  );

  onMount(async () => {
    try {
      if (!$authReady) {
        await new Promise<void>((resolve) => {
          const unsub = authReady.subscribe((ready) => {
            if (ready) {
              unsub();
              resolve();
            }
          });
        });
      }
      if (!$teacher) {
        goto('/login');
        return;
      }
      if (!sessionId) {
        error = 'Session not found';
        loading = false;
        return;
      }

      const snap = await getDoc(doc(db, 'sessions', sessionId));

      if (!snap.exists()) {
        error = 'Session not found';
        loading = false;
        return;
      }

      const sessionData = { id: sessionId, ...snap.data() } as Session;
      session = sessionData;
      currentIndex = session?.currentIndex ?? 0;
      const quizDoc = await getDoc(doc(db, 'quizzes', sessionData.quizId));
      if (!quizDoc.exists()) {
        error = 'Quiz not found';
        loading = false;
        return;
      }
      quiz = { id: quizDoc.id, ...quizDoc.data() } as Quiz;

      questions = [...(quiz.questions ?? [])].sort((a, b) => a.order - b.order);

      sessionUnsub = onSnapshot(
        doc(db, 'sessions', sessionId),
        (docSnap) => {
          if (!docSnap.exists()) {
            error = 'Session not found';
            loading = false;
            return;
          }
          session = { id: docSnap.id, ...docSnap.data() } as Session;
          loading = false;
        },
        (err) => {
          console.error('onSnapshot error', err);
          error = 'Failed to load session';
          loading = false;
        }
      );

      playersUnsub = onSnapshot(collection(db, 'sessions', sessionId, 'players'), (snap) => {
        players = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Player);
      });

      if (sessionData.status === 'active' && sessionData.liveQuestion) {
        if (sessionData.questionStartedAt) {
          listenToAnswers(sessionId, sessionData.liveQuestion.id);
          questionPhase = 'active';
          const serverNow = Date.now() + drift;
          const elapsed = (serverNow - sessionData.questionStartedAt.toMillis()) / 1000;
          const remaining = Math.max(0, Math.ceil(sessionData.liveQuestion.timeLimit - elapsed));
          if (remaining > 0) {
            startLocalCountdown(remaining);
          } else {
            questionPhase = 'finished';
          }
        } else if (sessionData.previewStartedAt) {
          questionPhase = 'preview';
          const elapsed = (Date.now() - sessionData.previewStartedAt.toMillis()) / 1000;
          const remaining = Math.max(0, Math.ceil(5 - elapsed));
          if (remaining > 0) {
            startPreviewCountdown(sessionData.liveQuestion, remaining);
          } else {
            questionPhase = 'finished';
          }
        }
      }
    } catch (e) {
      console.error('Failed to load session', e);
      error = 'Failed to load session';
      loading = false;
    }
  });

  onDestroy(() => {
    sessionUnsub?.();
    playersUnsub?.();
    answersUnsub?.();
    if (interval !== null) clearInterval(interval);
  });

  $effect(() => {
    const pingSessionId = sessionId;
    updateDoc(doc(db, 'sessions', pingSessionId), {
      lastPing: serverTimestamp()
    }).catch(console.log);
    const pingInterval = window.setInterval(() => {
      updateDoc(doc(db, 'sessions', pingSessionId), {
        lastPing: serverTimestamp()
      }).catch(console.log);
    }, 60000);
    return () => clearInterval(pingInterval);
  });

  function listenToAnswers(sessionId: string, questionId: string) {
    answersUnsub?.();
    answersUnsub = onSnapshot(
      query(
        collection(db, 'sessions', sessionId, 'answers'),
        where('questionId', '==', questionId)
      ),
      (snap) => {
        answersForCurrentQuestion = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Answer);
        for (const answer of answersForCurrentQuestion) {
          if (!answer.scored && isScorable(answer, questionId)) scoreAnswer(answer, questionId);
        }
      }
    );
  }

  function isScorable(answer: Answer, questionId: string) {
    const q = questions.find((q) => q.id === questionId);
    if (!q) return false;
    return q.type === 'quiz' || q.type === 'tf' || q.type === 'type';
  }

  async function scoreAnswer(answer: Answer, questionId: string) {
    const q = questions.find((q) => q.id === questionId);
    if (!q || !session?.questionStartedAt) return;

    let correct = false;
    if (q.type === 'quiz' || q.type === 'tf') {
      correct = answer.chosenAnswerId === q.correctAnswerId;
    } else if (q.type === 'type') {
      correct = answer.typedAnswer?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
    }

    const timeTaken = answer.answeredAt.toMillis() - session.questionStartedAt.toMillis();
    const ratio = Math.min(1, Math.max(0, timeTaken / (q.timeLimit * 1000)));
    const maxPoints = 1000;
    const points = correct ? Math.floor(maxPoints * (1 - ratio)) + 1 : 0;

    const answerRef = doc(db, 'sessions', sessionId, 'answers', answer.id);
    const playerRef = doc(db, 'sessions', sessionId, 'players', answer.playerId);

    await runTransaction(db, async (transaction) => {
      const playerDoc = await transaction.get(playerRef);
      const currentScore = playerDoc.data()?.score ?? 0;
      transaction.update(playerRef, { score: currentScore + points, pointsEarned: points });
      transaction.update(answerRef, { isCorrect: correct, scored: true, pointsEarned: points });
    });
  }

  function startPreviewCountdown(q: Question, remaining?: number) {
    clearInterval(interval!);
    const PREVIEW_SECONDS = 5;
    const adjustedStart =
      remaining != null ? Date.now() - (PREVIEW_SECONDS - remaining) * 1000 : Date.now();
    const tick = async () => {
      const passed = (Date.now() - adjustedStart) / 1000;
      countdown = Math.max(0, Math.ceil(PREVIEW_SECONDS - passed));
      if (countdown <= 0) {
        clearInterval(interval!);
        interval = null;
        await updateDoc(doc(db, 'sessions', session!.id), {
          questionStartedAt: serverTimestamp()
        });
        listenToAnswers(session!.id, q.id);
        if (q.type === 'poll' || q.type === 'wordCloud' || q.type === 'openEnded') {
          questionPhase = 'active';
        } else if (q.timeLimit === 0) {
          questionPhase = 'finished';
        } else {
          questionPhase = 'active';
          startLocalCountdown(q.timeLimit);
        }
      }
    };
    countdown = remaining ?? PREVIEW_SECONDS;
    tick();
    interval = window.setInterval(tick, 200);
  }

  function startLocalCountdown(timeLimit: number) {
    if (interval !== null) clearInterval(interval);
    if (timeLimit === 0) return;
    localCountdownStart = Date.now();
    countdown = timeLimit;
    interval = window.setInterval(() => {
      const elapsed = (Date.now() - localCountdownStart) / 1000;
      countdown = Math.max(0, Math.ceil(timeLimit - elapsed));
      if (countdown === 0) {
        clearInterval(interval!);
        interval = null;
        submitRemainingAnswers();
        updateDoc(doc(db, 'sessions', session!.id), { countdown: 0 });
        questionPhase = 'finished';
      }
    }, 200);
  }

  async function submitRemainingAnswers() {
    const answeredIds = new Set(answersForCurrentQuestion.map((a) => a.playerId));
    const unanswered = players.filter((p) => !answeredIds.has(p.id));
    if (unanswered.length === 0) return;

    const liveQ = session?.liveQuestion;
    const batch = unanswered.map((p) => ({
      playerId: p.id,
      questionId: liveQ?.id ?? '',
      type: liveQ?.type ?? 'quiz',
      chosenAnswerId: null,
      typedAnswer: null,
      playerName: p.playerName,
      answeredAt: serverTimestamp()
    }));

    for (const data of batch) {
      await addDoc(collection(db, 'sessions', sessionId, 'answers'), data);
    }
  }

  async function finishQuestion() {
    if (!session || !liveQuestion) return;
    const type = liveQuestion.type;
    if (type === 'poll' || type === 'wordCloud' || type === 'openEnded') {
      await submitRemainingAnswers();
      questionPhase = 'finished';
    }
  }

  async function startQuiz() {
    if (!session || players.length === 0) return;
    acting = true;
    loading = true;
    const q = questions[0];
    currentIndex = 0;
    await updateDoc(doc(db, 'sessions', session.id), {
      status: 'active',
      liveQuestion: q,
      previewStartedAt: serverTimestamp(),
      questionStartedAt: null,
      countdown: null,
      currentIndex: 0
    });
    questionPhase = 'preview';
    startPreviewCountdown(q);
    loading = false;
    acting = false;
  }

  async function nextQuestion() {
    if (!session || !questions.length) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      await endQuiz();
      return;
    }
    acting = true;
    loading = true;
    currentIndex = nextIndex;
    const q = questions[nextIndex];
    await updateDoc(doc(db, 'sessions', session.id), {
      liveQuestion: q,
      previewStartedAt: serverTimestamp(),
      questionStartedAt: null,
      countdown: null,
      currentIndex: currentIndex
    });
    questionPhase = 'preview';
    startPreviewCountdown(q);
    loading = false;
    acting = false;
  }

  async function endQuiz() {
    if (!session) return;
    acting = true;
    clearInterval(interval!);
    await updateDoc(doc(db, 'sessions', session.id), {
      status: 'finished',
      liveQuestion: null,
      questionStartedAt: null,
      countdown: null
    });
    acting = false;
  }
</script>

<div class="min-h-screen p-4">
  <div class="mx-auto max-w-2xl rounded-2xl bg-white shadow-lg p-6">
    <div class="flex items-center justify-between">
      <a href="/teacher/dashboard" class="text-slate-400 text-sm hover:text-slate-600 transition">&larr; Dashboard</a>
      <SignOutButton />
    </div>

    {#if error}
      <p class="text-red-500 mt-4">{error}</p>
    {:else if !session || loading}
      <p class="text-slate-500 mt-8">Loading…</p>
    {:else if session.status === 'waiting'}
      <div class="mt-8 text-center">
        <h1 class="text-2xl font-bold text-slate-900 mb-2">{quiz?.title ?? 'Quiz'}</h1>
        <p class="text-slate-500 mb-8">Share this code with your students</p>

        <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-8 mb-8">
          <div class="text-7xl font-mono font-bold tracking-[0.2em] text-indigo-600 select-all">
            {code}
          </div>
        </div>

        <div class="text-sm text-slate-500 mb-2">
          {players.length} student{players.length !== 1 ? 's' : ''} joined
        </div>

        {#if players.length > 0}
          <div class="flex flex-wrap gap-4 mb-8 justify-center">
            {#each players as p}
              <div class="flex flex-col items-center gap-1">
                {#if p.avatarConfig}
                  <div class="w-28 h-28">
                    <Avatar showBackground={false} {...p.avatarConfig} />
                  </div>
                {:else}
                  <div class="w-28 h-28 flex items-center justify-center text-3xl text-slate-400">
                    {p.playerName[0].toUpperCase()}
                  </div>
                {/if}
                <span class="text-sm text-slate-600">{p.playerName}</span>
              </div>
            {/each}
          </div>
        {/if}

        <button
          onclick={startQuiz}
          disabled={players.length === 0 || acting}
          class="rounded-xl bg-emerald-600 px-8 py-4 text-xl font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          Start Quiz
        </button>
      </div>
    {:else if session.status === 'active' && liveQuestion && !loading}
      <TeacherDashboard
        {liveQuestion}
        {countdown}
        {questionPhase}
        {currentIndex}
        {totalQuestions}
        {players}
        {answersForCurrentQuestion}
        {leaderboard}
        {acting}
        quizTitle={quiz?.title ?? ''}
        onnext={nextQuestion}
        onend={endQuiz}
        onfinish={finishQuestion}
      />
    {:else if session.status === 'finished' && quiz}
      <div class="mt-8">
        <h1 class="text-2xl font-bold text-slate-900 mb-6 text-center">Results</h1>

        <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-4">
          <div class="space-y-2">
            {#each leaderboard as entry}
              {@const isTop3 = entry.rank <= 3}
              <div class="flex items-center justify-between rounded-xl px-4 py-3 {isTop3 ? 'bg-indigo-50' : ''}">
                <div class="flex items-center gap-3">
                  <span class="text-sm font-bold w-6 {isTop3 ? 'text-amber-500' : 'text-slate-400'}">#{entry.rank}</span>
                  {#if entry.avatarConfig}
                    <div class="w-10 h-10">
                      <Avatar showBackground={false} {...entry.avatarConfig} />
                    </div>
                  {/if}
                  <span class="text-slate-800">{entry.playerName}</span>
                </div>
                <span class="font-mono font-bold text-indigo-600">{entry.score} pts</span>
              </div>
            {/each}
          </div>
        </div>

        <a href="/teacher/dashboard" class="block text-center rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700">
          Back to Dashboard
        </a>
      </div>
    {/if}
  </div>
</div>
