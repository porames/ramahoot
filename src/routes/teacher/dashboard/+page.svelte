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
    doc,
    serverTimestamp,
    setDoc
  } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { teacher, authReady } from '$lib/stores/auth';
  import { uniqueCode } from '$lib/utils/code';
  import type { Quiz, Session } from '$lib/types';
  import moment from 'moment';
  import SignOutButton from '$lib/SignOutButton.svelte';

  let quizzes = $state<Quiz[]>([]);
  let loading = $state(true);
  let starting = $state<string | null>(null);
  let pastSessions = $state<Session[]>([]);
  let quizTitleMap = $state<Map<string, string>>(new Map());
  let pastSessionsLoading = $state(true);
  let pastSessionsOpen = $state(true);

  onMount(async () => {
    if (!$authReady) {
      const unsub = authReady.subscribe((ready) => {
        if (ready && !$teacher) {
          goto('/login');
        }
        if (ready && $teacher) {
          loadQuizzes();
          loadPastSessions();
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
    loadPastSessions();
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
    loading = false;
  }

  async function loadPastSessions() {
    const user = $teacher;
    if (!user) return;

    try {
      const q = query(
        collection(db, 'sessions'),
        where('teacherId', '==', user.uid)
      );
      const snap = await getDocs(q);
      const all = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Session)
        .filter((s) => s.status === 'finished')
        .sort((a, b) => (b.startedAt?.toMillis() ?? 0) - (a.startedAt?.toMillis() ?? 0));

      const quizIds = [...new Set(all.map((s) => s.quizId).filter(Boolean))];
      const titles = new Map<string, string>();
      await Promise.all(
        quizIds.map(async (id) => {
          try {
            const quizSnap = await getDoc(doc(db, 'quizzes', id));
            if (quizSnap.exists()) titles.set(id, quizSnap.data().title);
          } catch {}
        })
      );
      for (const s of all) {
        if (s.quizTitle) titles.set(s.quizId, s.quizTitle);
      }

      quizTitleMap = titles;
      pastSessions = all;
    } catch (e) {
      console.error('Failed to load past sessions', e);
    } finally {
      pastSessionsLoading = false;
    }
  }

  function sessionQuizTitle(session: Session): string {
    return session.quizTitle || quizTitleMap.get(session.quizId) || 'Unknown Quiz';
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
        quizTitle: quiz.title,
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

    {#if !pastSessionsLoading && pastSessions.length > 0}
      <button
        onclick={() => (pastSessionsOpen = !pastSessionsOpen)}
        class="w-full flex items-center justify-between mb-4 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition cursor-pointer border border-slate-200"
      >
        <span class="text-sm font-semibold text-slate-700">
          Past Sessions ({pastSessions.length})
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 text-slate-500 transition"
          class:rotate-180={pastSessionsOpen}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {#if pastSessionsOpen}
        <div class="space-y-2 mb-6">
          {#each pastSessions.slice(0, 20) as session}
            <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-slate-800 truncate">{sessionQuizTitle(session)}</p>
                <p class="text-xs text-slate-500 mt-0.5">
                  {session.startedAt ? moment(session.startedAt.toMillis()).format('DD MMM YYYY, h:mm A') : 'Unknown date'}
                </p>
              </div>
              <a
                href="/teacher/dashboard/session/{session.id}/review"
                class="shrink-0 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
              >
                View Responses
              </a>
            </div>
          {/each}
        </div>
      {/if}
    {/if}

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
