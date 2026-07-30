<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { doc, getDoc, updateDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { teacher, authReady } from '$lib/stores/auth';
  import SignOutButton from '$lib/SignOutButton.svelte';
  import Input from '$lib/components/Input.svelte';
  import { Trash2 } from '@lucide/svelte';
  import Select from '$lib/components/Select.svelte';
  import OptionCard from '$lib/components/OptionCard.svelte';
  import TypeSelector from '$lib/components/TypeSelector.svelte';
  import Button from '$lib/components/Button.svelte';
  import type { Question, QuestionType } from '$lib/types';

  const quizId = $page.params.id!;

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
  let loading = $state(true);
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

  function questionToDraft(q: Question): QuestionDraft {
    return {
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      options: 'options' in q ? q.options.map((o) => ({ id: o.id, value: o.value })) : [],
      correctAnswerId: 'correctAnswerId' in q ? q.correctAnswerId : '',
      correctAnswer: 'correctAnswer' in q ? q.correctAnswer : '',
      timeLimit: q.timeLimit
    };
  }

  onMount(async () => {
    if (!$authReady) {
      const unsub = authReady.subscribe((ready) => {
        if (ready && !$teacher) {
          goto('/login');
        }
        unsub();
      });
      return;
    }
    if (!$teacher) {
      goto('/login');
      return;
    }

    const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
    if (!quizDoc.exists()) {
      error = 'Quiz not found';
      loading = false;
      return;
    }

    const data = quizDoc.data();
    if (data.teacherId !== $teacher?.uid) {
      error = 'Not your quiz';
      loading = false;
      return;
    }

    title = data.title ?? '';
    questions = (data.questions ?? []).map(questionToDraft);
    loading = false;
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

    saving = true;
    error = '';

    try {
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

      await updateDoc(doc(db, 'quizzes', quizId), {
        title: title.trim(),
        questions: questionsData
      });

      goto('/teacher/dashboard');
    } catch (e: any) {
      error = e.message || 'Failed to save quiz';
    } finally {
      saving = false;
    }
  }
</script>

<div class="min-h-screen p-4 bg-[#F0E6FF]">
  <div class="mx-auto max-w-2xl">
    <div class="relative bg-[#FFF8E7] border-[4px] border-black rounded-lg p-6">
      <div class="flex items-center justify-between mb-2">
        <a
          href="/teacher/dashboard"
          class="inline-flex items-center gap-1 border-[3px] border-black rounded-lg bg-[#4D7CFE] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all"
          >&larr; Dashboard</a
        >
        <SignOutButton />
      </div>

      <h1 class="text-3xl font-black uppercase tracking-tight text-black mt-4 mb-8">Edit Quiz</h1>

      {#if loading}
        <p class="text-sm font-bold text-black/50 uppercase">Loading…</p>
      {:else if error && !title}
        <p class="text-red-600 text-sm font-bold mt-4">{error}</p>
      {:else}
        <div class="mb-6">
          <Input
            id="quiz-title"
            label="Quiz Title"
            placeholder="e.g. Science Chapter 5 Review"
            bind:value={title}
          />
        </div>

        {#each questions as question, i}
          <div class="border-[3px] border-black rounded-lg bg-white p-6 mb-4 relative">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <h3 class="text-lg font-black text-black uppercase tracking-tight">
                  Question {i + 1}
                </h3>
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
                  class="flex-1 border-[3px] border-black rounded-lg px-6 py-4 text-lg font-black uppercase transition-all"
                  class:bg-[#17C964]={question.correctAnswerId === 'true'}
                  class:shadow-[4px_4px_0px_0px_#111]={question.correctAnswerId === 'true'}
                  class:bg-white={question.correctAnswerId !== 'true'}
                  class:hover:shadow-[4px_4px_0px_0px_#111]={question.correctAnswerId !== 'true'}
                  >True</button
                >
                <button
                  onclick={() => (question.correctAnswerId = 'false')}
                  class="flex-1 border-[3px] border-black rounded-lg px-6 py-4 text-lg font-black uppercase transition-all"
                  class:bg-[#FF5FA2]={question.correctAnswerId === 'false'}
                  class:text-white={question.correctAnswerId === 'false'}
                  class:shadow-[4px_4px_0px_0px_#111]={question.correctAnswerId === 'false'}
                  class:bg-white={question.correctAnswerId !== 'false'}
                  class:text-black={question.correctAnswerId !== 'false'}
                  class:hover:shadow-[4px_4px_0px_0px_#111]={question.correctAnswerId !== 'false'}
                  >False</button
                >
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
                    <span class="text-sm font-black text-black w-6"
                      >{String.fromCharCode(65 + j)}</span
                    >
                    <input
                      bind:value={option.value}
                      type="text"
                      placeholder="Option {String.fromCharCode(65 + j)}"
                      class="flex-1 border-[3px] border-black rounded-lg bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:shadow-[3px_3px_0px_0px_#111] transition-shadow"
                    />
                    {#if question.options.length > 1}
                      <button
                        onclick={() => removePollOption(question, j)}
                        class="text-red-500 hover:text-red-600 transition text-sm font-black uppercase"
                        ><Trash2 size={18} /></button
                      >
                    {/if}
                  </div>
                {/each}
                <button
                  onclick={() => addPollOption(question)}
                  class="text-[#4D7CFE] text-sm font-black uppercase tracking-wide hover:text-[#3a6ae8] transition"
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
          <p class="text-red-600 text-sm font-bold mb-4">{error}</p>
        {/if}

        <Button onclick={saveQuiz} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      {/if}
    </div>
  </div>
</div>
