<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { collection, doc, setDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { teacher, authReady } from '$lib/stores/auth';
  import SignOutButton from '$lib/SignOutButton.svelte';
  import type { QuestionOption, Question } from '$lib/types';

  interface QuestionDraft {
    id: string;
    prompt: string;
    options: QuestionOption[];
    correctAnswerId: string;
    timeLimit: number;
  }

  let title = $state('');
  let questions = $state<QuestionDraft[]>([]);
  let saving = $state(false);
  let error = $state('');

  function blankQuestion(): QuestionDraft {
    const options = Array.from({ length: 4 }, () => ({
      id: crypto.randomUUID(),
      value: ''
    }));
    return {
      id: crypto.randomUUID(),
      prompt: '',
      options,
      correctAnswerId: '',
      timeLimit: 30
    };
  }

  onMount(() => {
    if ($authReady && !$teacher) {
      goto('/login');
      return;
    }
    if (questions.length === 0) {
      questions.push(blankQuestion());
    }
  });

  function addQuestion() {
    questions.push(blankQuestion());
  }

  function removeQuestion(index: number) {
    if (questions.length > 1) {
      questions.splice(index, 1);
    }
  }

  async function saveQuiz() {
    if (!title.trim()) {
      error = 'Please enter a quiz title';
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt.trim()) {
        error = `Question ${i + 1} is missing a prompt`;
        return;
      }
      if (q.options.some((o) => !o.value.trim())) {
        error = `Question ${i + 1} has empty options`;
        return;
      }
      if (!q.correctAnswerId) {
        error = `Question ${i + 1} is missing a correct answer`;
        return;
      }
    }

    const user = $teacher;
    if (!user) {
      error = 'Not signed in';
      return;
    }

    saving = true;
    error = '';

    try {
      const quizRef = doc(collection(db, 'quizzes'));
      const questionsData: Question[] = questions.map((q, i) => ({
        id: q.id,
        prompt: q.prompt.trim(),
        options: q.options.map((o) => ({ id: o.id, value: o.value.trim() })),
        correctAnswerId: q.correctAnswerId,
        timeLimit: q.timeLimit,
        order: i
      }));

      await setDoc(quizRef, {
        title: title.trim(),
        teacherId: user.uid,
        teacherName: user.displayName || 'Teacher',
        questions: questionsData,
        createdAt: new Date()
      });

      goto('/teacher/dashboard');
    } catch (e: any) {
      error = e.message || 'Failed to save quiz';
    } finally {
      saving = false;
    }
  }
</script>

<div class="min-h-screen p-4">
  <div class="mx-auto max-w-2xl rounded-2xl bg-white shadow-lg p-6">
    <div class="flex items-center justify-between">
      <a href="/teacher/dashboard" class="text-slate-400 text-sm hover:text-slate-600 transition">&larr; Dashboard</a>
      <SignOutButton />
    </div>

    <h1 class="text-3xl font-bold text-slate-900 mt-4 mb-8">Create a Quiz</h1>

    <div class="mb-6">
      <label for="quiz-title" class="block text-sm font-medium text-slate-700 mb-1"
        >Quiz Title</label
      >
      <input
        id="quiz-title"
        bind:value={title}
        type="text"
        placeholder="e.g. Science Chapter 5 Review"
        class="w-full rounded-xl bg-white border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>

    {#each questions as question, i}
      <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-4 relative">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-700">Question {i + 1}</h3>
          {#if questions.length > 1}
            <button
              onclick={() => removeQuestion(i)}
              class="text-red-500 text-sm hover:text-red-600 transition"
            >
              Remove
            </button>
          {/if}
        </div>

        <div class="mb-4">
          <input
            bind:value={question.prompt}
            type="text"
            placeholder="Enter question prompt…"
            class="w-full rounded-xl bg-white border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {#each question.options as option, j}
            <div
              class="flex rounded-xl border border-slate-300 overflow-hidden transition-colors"
              class:border-emerald-500={question.correctAnswerId === option.id}
              class:bg-emerald-50={question.correctAnswerId === option.id}
            >
              <label
                class="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors border-r border-slate-200"
                class:bg-slate-50={question.correctAnswerId !== option.id}
                class:hover:bg-slate-100={question.correctAnswerId !== option.id}
                class:bg-emerald-100={question.correctAnswerId === option.id}
              >
                <input
                  type="radio"
                  tabindex="-1"
                  name="correct-{question.id}"
                  bind:group={question.correctAnswerId}
                  value={option.id}
                  class="accent-indigo-600 w-4 h-4 cursor-pointer"
                />
                <span class="font-semibold text-sm w-4 text-center"
                  >{String.fromCharCode(65 + j)}</span
                >
              </label>
              <input
                bind:value={option.value}
                type="text"
                placeholder={String.fromCharCode(65 + j)}
                class="w-full flex-1 px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white/80 bg-transparent"
              />
            </div>
          {/each}
        </div>

        <div>
          <label
            for="time-limit-{question.id}"
            class="block text-sm font-medium text-slate-700 mb-1">Time Limit</label
          >
          <select
            id="time-limit-{question.id}"
            bind:value={question.timeLimit}
            class="rounded-xl bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={5}>5 sec</option>
            <option value={10}>10 sec</option>
            <option value={15}>15 sec</option>
            <option value={20}>20 sec</option>
            <option value={30}>30 sec</option>
            <option value={45}>45 sec</option>
            <option value={60}>1 min</option>
          </select>
        </div>
      </div>
    {/each}

    <button
      onclick={addQuestion}
      class="w-full rounded-xl border-2 border-dashed border-slate-300 py-3 text-slate-400 transition hover:border-slate-400 hover:text-slate-500 mb-4"
    >
      + Add Question
    </button>

    {#if error}
      <p class="text-red-500 text-sm mb-4">{error}</p>
    {/if}

    <button
      onclick={saveQuiz}
      disabled={saving}
      class="w-full rounded-xl bg-indigo-600 py-3 text-lg font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
    >
      {saving ? 'Saving…' : 'Save Quiz'}
    </button>
  </div>
</div>
