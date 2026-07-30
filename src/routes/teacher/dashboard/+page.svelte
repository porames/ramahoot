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
    limit,
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
  let pastSessionsOpen = $state(false);

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
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const snap = await getDocs(q);
    quizzes = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Quiz);
    loading = false;
  }

  async function loadPastSessions() {
    const user = $teacher;
    if (!user) return;

    try {
      const q = query(collection(db, 'sessions'), where('teacherId', '==', user.uid));
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

<div class="min-h-screen p-4 bg-[#F0E6FF]">
  <div class="mx-auto max-w-4xl">
    <div class="relative bg-[#FFF8E7] border-[4px] border-black rounded-lg p-6">
      <div class="flex items-center justify-between mb-8 mt-4">
        <div>
          <h1 class="text-3xl font-black uppercase tracking-tight text-black">My Quizzes</h1>
          {#if $teacher}
            <p class="text-xs font-bold text-black/50 mt-1 uppercase">
              {$teacher.displayName || 'Teacher'}
            </p>
          {/if}
        </div>
        <div>
          <SignOutButton />
        </div>
      </div>

      {#if loading}
        <div class="space-y-3">
          {#each Array(3) as _}
            <div class="h-20 rounded-lg bg-slate-100 animate-pulse border-[3px] border-black"></div>
          {/each}
        </div>
      {:else if quizzes.length === 0}
        <div class="border-[3px] border-black rounded-lg p-12 text-center bg-[#FFD23F]/10">
          <div class="text-5xl mb-4">&#x1F3B2;</div>
          <h2 class="text-xl font-black uppercase text-black mb-2">No quizzes yet</h2>
          <p class="text-sm font-bold text-black/60 mb-6">
            Create your first quiz and share it with your students.
          </p>
          <a
            href="/teacher/create"
            class="inline-block border-[3px] border-black rounded-lg bg-[#FFD23F] px-6 py-3 font-black uppercase tracking-wide text-black text-sm shadow-[4px_4px_0px_0px_#111] hover:shadow-[6px_6px_0px_0px_#111] hover:-translate-y-0.5 transition-all"
          >
            Create a Quiz
          </a>
        </div>
      {:else}
        <div class="space-y-3">
          {#each quizzes as quiz}
            <div class="border-[3px] border-black rounded-lg bg-white p-5">
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-1">
                    <h3 class="text-lg font-black text-black truncate uppercase tracking-tight">
                      {quiz.title}
                    </h3>
                  </div>
                  <div class="flex items-center gap-4 text-xs font-bold text-black/50 uppercase">
                    <span>{quiz.questions.length} questions</span>
                    <span>{formatDate(quiz)}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0 ml-3">
                  <a
                    href="/teacher/edit/{quiz.id}"
                    class="border-[3px] border-black rounded-lg bg-[#4D7CFE] px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all"
                  >
                    Edit
                  </a>
                  <button
                    onclick={() => startSession(quiz)}
                    disabled={starting === quiz.id}
                    class="border-[3px] border-black rounded-lg bg-[#17C964] px-5 py-2.5 text-xs font-black uppercase tracking-wide text-black shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all disabled:opacity-40"
                  >
                    {starting === quiz.id ? 'Starting…' : 'Start'}
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
        <a
          href="/teacher/create"
          class="mt-4 inline-flex items-center gap-2 border-[3px] border-black rounded-lg bg-[#FF5FA2] px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Quiz
        </a>
      {/if}

      {#if !pastSessionsLoading && pastSessions.length > 0}
        <button
          onclick={() => (pastSessionsOpen = !pastSessionsOpen)}
          class="w-full flex items-center justify-between mt-6 p-3 border-[3px] border-black rounded-lg bg-white hover:bg-gray-100 transition-all cursor-pointer"
        >
          <span class="text-sm font-black uppercase tracking-wide text-black"> Past Sessions </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 text-black transition-transform"
            class:rotate-180={pastSessionsOpen}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {#if pastSessionsOpen}
          <div class="space-y-2 mt-3">
            {#each pastSessions.slice(0, 20) as session}
              <div
                class="flex items-center justify-between border-[3px] border-black rounded-lg bg-[#F0F4FF] px-4 py-3"
              >
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-black text-black uppercase truncate">
                    {sessionQuizTitle(session)}
                  </p>
                  <p class="text-xs font-bold text-black/50 mt-0.5">
                    {session.startedAt
                      ? moment(session.startedAt.toMillis()).format('DD MMM YYYY, h:mm A')
                      : 'Unknown date'}
                  </p>
                </div>
                <a
                  href="/teacher/dashboard/session/{session.id}/review"
                  class="shrink-0 border-[3px] border-black rounded-lg bg-[#FFD23F] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-black shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all"
                >
                  View
                </a>
              </div>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>
