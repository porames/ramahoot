<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { collection, doc, setDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { teacher, authReady } from '$lib/stores/auth';
  import { Trash2 } from '@lucide/svelte';
  import SignOutButton from '$lib/SignOutButton.svelte';
  import Input from '$lib/components/Input.svelte';
  import Select from '$lib/components/Select.svelte';
  import OptionCard from '$lib/components/OptionCard.svelte';
  import TypeSelector from '$lib/components/TypeSelector.svelte';
  import Button from '$lib/components/Button.svelte';
  import type { Question, QuestionType } from '$lib/types';

  interface QuestionDraft {
    id: string;
    type: QuestionType;
    prompt: string;
    options: { id: string; value: string }[];
    correctAnswerId: string;
    correctAnswer: string;
    timeLimit: number;
  }

  let title = $state('');
  let questions = $state<QuestionDraft[]>([]);
  let saving = $state(false);
  let error = $state('');

  const timeLimitOptions = [
    { value: 5, label: '5 sec' },
    { value: 10, label: '10 sec' },
    { value: 15, label: '15 sec' },
    { value: 20, label: '20 sec' },
    { value: 30, label: '30 sec' },
    { value: 45, label: '45 sec' },
    { value: 60, label: '1 min' }
  ];

  function blankQuestion(type: QuestionType = 'quiz'): QuestionDraft {
    const base = {
      id: crypto.randomUUID(),
      type,
      prompt: '',
      options: [] as { id: string; value: string }[],
      correctAnswerId: '',
      correctAnswer: '',
      timeLimit: type === 'poll' || type === 'wordCloud' || type === 'openEnded' ? 0 : 30
    };

    if (type === 'quiz' || type === 'poll') {
      base.options = Array.from({ length: type === 'poll' ? 2 : 4 }, () => ({
        id: crypto.randomUUID(),
        value: ''
      }));
    } else if (type === 'tf') {
      base.options = [
        { id: 'true', value: 'True' },
        { id: 'false', value: 'False' }
      ];
    }

    return base;
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

  function changeType(question: QuestionDraft, newType: QuestionType) {
    const fresh = blankQuestion(newType);
    question.type = newType;
    question.options = fresh.options;
    question.correctAnswerId = '';
    question.correctAnswer = '';
    if (newType === 'tf') {
      question.options = [
        { id: 'true', value: 'True' },
        { id: 'false', value: 'False' }
      ];
    }
  }

  function addPollOption(question: QuestionDraft) {
    question.options.push({ id: crypto.randomUUID(), value: '' });
  }

  function removePollOption(question: QuestionDraft, index: number) {
    if (question.options.length > 1) {
      question.options.splice(index, 1);
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
      if (q.type === 'quiz' || q.type === 'poll') {
        if (q.options.some((o) => !o.value.trim())) {
          error = `Question ${i + 1} has empty options`;
          return;
        }
      }
      if (q.type === 'quiz' && !q.correctAnswerId) {
        error = `Question ${i + 1} is missing a correct answer`;
        return;
      }
      if (q.type === 'tf' && !q.correctAnswerId) {
        error = `Question ${i + 1} is missing a correct answer`;
        return;
      }
      if (q.type === 'type' && !q.correctAnswer.trim()) {
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
      const questionsData: Question[] = questions.map((q, i) => {
        const base = {
          id: q.id,
          prompt: q.prompt.trim(),
          order: i,
          timeLimit: q.timeLimit
        };
        switch (q.type) {
          case 'quiz':
            return {
              ...base,
              type: 'quiz' as const,
              options: q.options.map((o) => ({ id: o.id, value: o.value.trim() })),
              correctAnswerId: q.correctAnswerId
            };
          case 'tf':
            return {
              ...base,
              type: 'tf' as const,
              options: q.options.map((o) => ({ id: o.id, value: o.value.trim() })),
              correctAnswerId: q.correctAnswerId
            };
          case 'type':
            return {
              ...base,
              type: 'type' as const,
              correctAnswer: q.correctAnswer.trim()
            };
          case 'poll':
            return {
              ...base,
              type: 'poll' as const,
              options: q.options.map((o) => ({ id: o.id, value: o.value.trim() }))
            };
          case 'wordCloud':
            return { ...base, type: 'wordCloud' as const };
          case 'openEnded':
            return { ...base, type: 'openEnded' as const };
        }
      });

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
      <a href="/teacher/dashboard" class="text-slate-400 text-sm hover:text-slate-600 transition"
        >&larr; Dashboard</a
      >
      <SignOutButton />
    </div>

    <h1 class="text-3xl font-bold text-slate-900 mt-4 mb-8">Create a Quiz</h1>

    <div class="mb-6">
      <Input
        id="quiz-title"
        label="Quiz Title"
        placeholder="e.g. Science Chapter 5 Review"
        bind:value={title}
      />
    </div>

    {#each questions as question, i}
      <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-4 relative">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <h3 class="text-lg font-semibold text-slate-700">Question {i + 1}</h3>
            {#if questions.length > 1}
              <Button variant="danger" onclick={() => removeQuestion(i)}>Remove</Button>
            {/if}
          </div>
          <TypeSelector bind:value={question.type} onchange={(v) => changeType(question, v)} />
        </div>

        <div class="mb-4">
          <Input placeholder="Enter question prompt" bind:value={question.prompt} />
        </div>

        {#if question.type === 'quiz'}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {#each question.options as option, j}
              <OptionCard
                name="correct-{question.id}"
                optionId={option.id}
                letter={String.fromCharCode(65 + j)}
                bind:value={option.value}
                bind:group={question.correctAnswerId}
              />
            {/each}
          </div>
        {:else if question.type === 'tf'}
          <div class="flex gap-3 mb-4">
            <button
              onclick={() => (question.correctAnswerId = 'true')}
              class="flex-1 rounded-xl border-2 px-6 py-4 text-lg font-semibold transition"
              class:border-emerald-500={question.correctAnswerId === 'true'}
              class:bg-emerald-50={question.correctAnswerId === 'true'}
              class:border-slate-300={question.correctAnswerId !== 'true'}
              class:bg-white={question.correctAnswerId !== 'true'}
              class:hover:bg-slate-50={question.correctAnswerId !== 'true'}
            >
              True
            </button>
            <button
              onclick={() => (question.correctAnswerId = 'false')}
              class="flex-1 rounded-xl border-2 px-6 py-4 text-lg font-semibold transition"
              class:border-emerald-500={question.correctAnswerId === 'false'}
              class:bg-red-50={question.correctAnswerId === 'false'}
              class:border-red-300={question.correctAnswerId === 'false'}
              class:border-slate-300={question.correctAnswerId !== 'false'}
              class:bg-white={question.correctAnswerId !== 'false'}
              class:hover:bg-slate-50={question.correctAnswerId !== 'false'}
            >
              False
            </button>
          </div>
        {:else if question.type === 'type'}
          <div class="mb-4">
            <Input
              label="Correct Answer"
              placeholder="Enter the exact correct answer"
              bind:value={question.correctAnswer}
            />
          </div>
        {:else if question.type === 'poll'}
          <div class="space-y-2 mb-4">
            {#each question.options as option, j}
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-slate-500 w-6"
                  >{String.fromCharCode(65 + j)}</span
                >
                <input
                  bind:value={option.value}
                  type="text"
                  placeholder="Option {String.fromCharCode(65 + j)}"
                  class="flex-1 rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {#if question.options.length > 1}
                  <button
                    onclick={() => removePollOption(question, j)}
                    class="text-red-400 hover:text-red-600 transition text-sm font-semibold"
                    ><Trash2 size={18} /></button
                  >
                {/if}
              </div>
            {/each}
            <button
              onclick={() => addPollOption(question)}
              class="text-indigo-600 text-sm font-semibold hover:text-indigo-700 transition"
              >+ Add option</button
            >
          </div>
        {/if}

        {#if question.type !== 'poll' && question.type !== 'wordCloud' && question.type !== 'openEnded'}
          <div>
            <Select
              id="time-limit-{question.id}"
              label="Time Limit"
              options={timeLimitOptions}
              bind:value={question.timeLimit}
            />
          </div>
        {/if}
      </div>
    {/each}

    <Button class="mb-4" variant="dashed" onclick={addQuestion}>+ Add Question</Button>

    {#if error}
      <p class="text-red-500 text-sm mb-4">{error}</p>
    {/if}

    <Button onclick={saveQuiz} disabled={saving}>
      {saving ? 'Saving…' : 'Save Quiz'}
    </Button>
  </div>
</div>
