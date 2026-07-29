<script lang="ts">
  import { goto } from '$app/navigation';
  import {
    collection,
    query,
    where,
    getDocs,
    doc,
    Timestamp,
    addDoc,
    serverTimestamp,
    getDoc
  } from 'firebase/firestore';
  import { db } from '$lib/firebase';

  let step = $state('enterCode');
  let codeDigits = $state(['', '', '', '', '', '']);
  let playerName = $state('');
  let joining = $state(false);
  let error = $state('');

  let inputRefs = $state<HTMLInputElement[]>([]);

  function handleDigitInput(index: number) {
    const inputs = inputRefs;
    if (inputs[index].value.length > 1) {
      inputs[index].value = inputs[index].value.slice(-1);
    }
    codeDigits[index] = inputs[index].value;

    if (inputs[index].value && index < 5) {
      inputs[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent) {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      codeDigits[index - 1] = '';
      inputRefs[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) ?? '';
    const inputs = inputRefs;
    for (let i = 0; i < 6; i++) {
      codeDigits[i] = pasted[i] || '';
      if (inputs[i]) inputs[i].value = pasted[i] || '';
    }
    if (pasted.length < 6) {
      inputs[pasted.length]?.focus();
    }
  }

  const code = $derived(codeDigits.join(''));
  const canNext = $derived(code.length === 6);
  const canJoin = $derived(code.length === 6 && playerName !== '');

  async function join() {
    if (!canJoin) return;
    joining = true;
    error = '';

    try {
      // find game in active state and teacher is pinging
      const q = query(
        collection(db, 'sessions'),
        where('code', '==', code),
        where('status', '==', 'waiting'),
        where('lastPing', '>=', Timestamp.fromMillis(Date.now() - 60000))
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        error = 'Invalid code. Check and try again.';
        joining = false;
        return;
      }

      const sessionDoc = snap.docs[0];
      const sessionId = sessionDoc.id;
      const sessionData = sessionDoc.data();

      if (sessionData.status !== 'waiting') {
        error = 'This quiz has already started or ended.';
        joining = false;
        return;
      }

      const t0 = Date.now();
      const playerRef = await addDoc(collection(db, 'sessions', sessionId, 'players'), {
        playerName: playerName.trim(),
        score: 0,
        joinedAt: serverTimestamp()
      });
      const playerId = playerRef.id;
      const playerSnap = await getDoc(playerRef);
      if (playerSnap.exists()) {
        const joinedAt = playerSnap.data().joinedAt;
        const t1 = Date.now();
        const serverTime = joinedAt.toMillis();
        const estimatedOffset = serverTime - (t0 + (t1 - t0) / 2);
        console.log(estimatedOffset);
        localStorage.setItem('drift', String(estimatedOffset));
      }
      localStorage.setItem('sessionId', sessionId);
      localStorage.setItem('playerId', playerId);
      step = 'setName';
      goto(`/play/${sessionId}`);
    } catch (e: any) {
      error = e.message || 'Failed to join';
    } finally {
      joining = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center p-4">
  <div class="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
    <a href="/" class="text-slate-400 text-sm hover:text-slate-600 transition">&larr; Home</a>

    <h1 class="text-2xl font-bold text-slate-900 mt-4 mb-6">Join a Quiz</h1>

    {#if step == 'enterCode'}
      <div class="mb-6">
        <label for="code-0" class="block text-sm font-medium text-slate-700 mb-2"
          >Enter 6-digit code</label
        >
        <div class="flex gap-2 justify-center">
          {#each Array(6) as _, i}
            <input
              id={i === 0 ? 'code-0' : 'code-' + i}
              bind:this={inputRefs[i]}
              type="text"
              inputmode="numeric"
              maxlength="1"
              value={codeDigits[i]}
              oninput={() => handleDigitInput(i)}
              onkeydown={(e) => handleKeyDown(i, e)}
              onpaste={i === 0 ? handlePaste : undefined}
              class="w-12 h-14 text-center text-2xl font-mono font-bold rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          {/each}
        </div>
      </div>

      <button
        onclick={() => {
          step = 'setName';
        }}
        disabled={!canNext}
        class="w-full rounded-xl bg-emerald-600 py-3 text-lg font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        Next
      </button>
    {:else if step == 'setName'}
      <div class="mb-6">
        <label for="student-name" class="block text-sm font-medium text-slate-700 mb-2"
          >Your name</label
        >
        <input
          id="student-name"
          bind:value={playerName}
          type="text"
          placeholder="Enter your name"
          maxlength="30"
          class="w-full rounded-xl bg-white border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <button
        onclick={join}
        disabled={!canJoin || joining}
        class="w-full rounded-xl bg-emerald-600 py-3 text-lg font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {joining ? 'Joining…' : 'Join'}
      </button>
    {/if}

    {#if error}
      <p class="text-red-500 text-sm mb-4">{error}</p>
    {/if}
  </div>
</div>
