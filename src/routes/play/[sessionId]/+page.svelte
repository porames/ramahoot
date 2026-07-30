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
  import ActiveQuizCard from '$lib/components/ActiveQuizCard.svelte';

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
  let textAnswer = $state('');
  let submitted = $state(false);
  let isCorrect = $state(false);
  let pointsEarned = $state(0);
  let scored = $state(false);
  let loading = $state(true);
  let error = $state('');
  let screen = $state<'waiting' | 'active' | 'answered' | 'finished'>('waiting');
  let previewMode = $state(false);
  let avatarConfig = $state<AvatarConfig | null>(null);

  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  let noTimeLimit = $derived(question != null && question.timeLimit === 0);
  let countdownActive = $derived(countdown != null && countdown > 0);

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
      const sessionSnap = await getDoc(doc(db, 'sessions', sessionId));
      if (!sessionSnap.exists()) {
        error = 'Session not found';
        loading = false;
        return;
      }

      const sessionData = { id: sessionSnap.id, ...sessionSnap.data() } as Session;
      session = sessionData;
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
        if (timeLimit === 0) {
          countdown = -1;
          return;
        }
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
            scored = false;
            selectedOptionId = null;
            textAnswer = '';
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
        if (ans.scored) scored = true;
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
      answerId = snap.docs[0].id;
      submitted = true;
      selectedOptionId = ans.chosenAnswerId;
      if (question != null && (question.type === 'type' || question.type === 'wordCloud' || question.type === 'openEnded')) {
        textAnswer = ans.typedAnswer ?? '';
      }
      if (ans.isCorrect !== undefined) isCorrect = ans.isCorrect;
      if (ans.scored) scored = true;
      listenForAnswers();
    }
  }

  async function submitAnswer(value: string | null) {
    if (submitted || !session || !question || !playerId || !sessionId) return;

    submitted = true;
    selectedOptionId = value;

    const isTextType = question.type === 'type' || question.type === 'wordCloud' || question.type === 'openEnded';

    const ansRef = await addDoc(collection(db, 'sessions', sessionId, 'answers'), {
      playerId,
      questionId: question.id,
      type: question.type,
      chosenAnswerId: isTextType ? null : value,
      typedAnswer: isTextType ? value : null,
      playerName,
      answeredAt: serverTimestamp()
    });
    answerId = ansRef.id;
    listenForAnswers();
  }

  async function submitTextAnswer() {
    await submitAnswer(textAnswer.trim());
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
    if (q.type === 'type') return q.correctAnswer;
    if ('options' in q && 'correctAnswerId' in q) {
      return q.options.find((o) => o.id === q.correctAnswerId)?.value ?? '';
    }
    return '';
  }
</script>

<div class="min-h-screen flex items-center justify-center p-4 bg-[#F0E6FF]">
  <div class="w-full max-w-lg">
    <div class="relative bg-[#FFF8E7] border-[4px] border-black rounded-lg p-6">
      {#if loading}
        <div class="text-center">
          <p class="text-sm font-bold text-black/50 uppercase">Loading…</p>
        </div>
      {:else if error}
        <div class="text-center">
          <p class="text-red-600 text-sm font-bold">{error}</p>
          <a href="/join" class="inline-block mt-4 border-[3px] border-black rounded-lg bg-[#4D7CFE] px-4 py-2 text-xs font-black uppercase tracking-wide text-white shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all">Try again</a>
        </div>
      {:else if screen === 'waiting'}
        <div class="text-center">
          <div class="border-[3px] border-black rounded-lg bg-[#F0F4FF] p-8">
            <div class="text-5xl mb-4">&#x1F3AF;</div>
            <h1 class="text-2xl font-black uppercase tracking-tight text-black mb-2">You're in!</h1>
            <p class="text-xs font-bold text-black/60 uppercase">Waiting for the teacher to start the quiz…</p>
            <AvatarCreator onConfigChange={(c: AvatarConfig) => (avatarConfig = c)} savedConfig={avatarConfig} />
          </div>
        </div>
      {:else if screen === 'active' && question && (countdown !== null || noTimeLimit)}
        <ActiveQuizCard
          {question}
          countdown={countdown ?? 0}
          {countdownActive}
          {noTimeLimit}
          {previewMode}
          {submitted}
          {isCorrect}
          {pointsEarned}
          {scored}
          {currentIndex}
          {totalQuestions}
          bind:textAnswer
          onsubmit={submitAnswer}
          onsubmittext={submitTextAnswer}
          {getCorrectAnswerText}
        />
      {:else if screen === 'finished'}
        <div class="text-center">
          <div class="border-[3px] border-black rounded-lg bg-[#F0FFF4] p-8">
            <div class="text-5xl mb-4">&#x1F3C6;</div>
            <h2 class="text-2xl font-black uppercase tracking-tight text-black mb-4">Quiz Complete!</h2>
            <div class="text-6xl font-black text-black mb-2">{score}</div>
            <p class="text-xs font-bold text-black/60 uppercase">points earned</p>
          </div>
          <a href="/play" class="inline-block mt-6 border-[3px] border-black rounded-lg bg-[#FF5FA2] px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all">Join another quiz</a>
        </div>
      {/if}
    </div>
  </div>
</div>
