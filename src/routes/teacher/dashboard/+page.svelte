<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    orderBy,
    addDoc,
    doc,
    serverTimestamp,
    setDoc
  } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { teacher, authReady } from '$lib/stores/auth';
  import { uniqueCode } from '$lib/utils/code';
  import type { Quiz } from '$lib/types';
  import moment from 'moment';
  import SignOutButton from '$lib/SignOutButton.svelte';

  let quizzes = $state<Quiz[]>([]);
  let loading = $state(true);
  let starting = $state<string | null>(null);

  onMount(async () => {
    if (!$authReady) {
      const unsub = authReady.subscribe((ready) => {
        if (ready && !$teacher) {
          goto('/login');
        }
        if (ready && $teacher) {
          loadQuizzes();
        }
        unsub();
      });
      return;
    }
    if (!$teacher) {
      goto('/login');
      return;
    }
    loadQuizzes();
  });

  async function loadQuizzes() {
    const user = $teacher;
    if (!user) return;

    const q = query(
      collection(db, 'quizzes'),
      where('teacherId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    quizzes = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Quiz);
    console.log(quizzes);
    loading = false;
  }

  async function startSession(quiz: Quiz) {
    starting = quiz.id;
    try {
      const code = await uniqueCode();
      const sessionRef = doc(collection(db, 'sessions'));
      const t0 = Date.now();
      await setDoc(sessionRef, {
        code,
        quizId: quiz.id,
        teacherId: quiz.teacherId,
        status: 'waiting',
        liveQuestion: null,
        countdown: null,
        startedAt: serverTimestamp()
      });
      const sessionSnap = await getDoc(sessionRef);
      if (sessionSnap.exists()) {
        const startedAt = sessionSnap.data().startedAt;
        const t1 = Date.now();
        const serverTime = startedAt.toMillis();
        const estimatedOffset = serverTime - (t0 + (t1 - t0) / 2);
        localStorage.setItem('teacherDrift', String(estimatedOffset));
      }
      goto(`/teacher/dashboard/${sessionRef.id}`);
    } catch (e: any) {
      console.error('Failed to start session', e);
    } finally {
      starting = null;
    }
  }

  function formatDate(quiz: Quiz): string {
    const ts = quiz.createdAt as any;
    return moment(ts?.toMillis?.() ?? ts ?? Date.now()).format('DD MMM YYYY');
  }
</script>

<div class="min-h-screen p-4">
  <div class="mx-auto max-w-4xl rounded-2xl bg-white shadow-lg p-6">
    <div class="flex items-center justify-between mb-8 mt-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">My Quizzes</h1>
        {#if $teacher}
          <p class="text-slate-500 text-sm mt-1">{$teacher.displayName || 'Teacher'}</p>
        {/if}
      </div>
      <div>
        <SignOutButton />
      </div>
    </div>

    {#if loading}
      <div class="space-y-3">
        {#each Array(3) as _}
          <div class="h-20 rounded-2xl bg-slate-100 animate-pulse"></div>
        {/each}
      </div>
    {:else if quizzes.length === 0}
      <div class="rounded-2xl border border-slate-200 p-12 text-center">
        <div class="text-4xl mb-4">&#x1F3B2;</div>
        <h2 class="text-xl font-semibold text-slate-700 mb-2">No quizzes yet</h2>
        <p class="text-slate-500 mb-6">Create your first quiz and share it with your students.</p>
        <a
          href="/teacher/create"
          class="inline-block rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
        >
          Create a Quiz
        </a>
      </div>
    {:else}
      <div class="space-y-3">
        {#each quizzes as quiz}
          <div
            class="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 mb-1">
                  <h3 class="text-lg font-semibold text-slate-900 truncate">{quiz.title}</h3>
                </div>
                <div class="flex items-center gap-4 text-sm text-slate-500">
                  <span>{quiz.questions.length} questions</span>
                  <span>{formatDate(quiz)}</span>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0 ml-3">
                <a
                  href="/teacher/edit/{quiz.id}"
                  class="rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Edit
                </a>
                <button
                  onclick={() => startSession(quiz)}
                  disabled={starting === quiz.id}
                  class="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {starting === quiz.id ? 'Starting…' : 'Start Session'}
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
      <a
        href="/teacher/create"
        class="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-indigo-500 px-5 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Quiz
      </a>
    {/if}
  </div>
</div>
