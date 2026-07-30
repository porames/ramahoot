<script lang="ts">
  import { goto } from '$app/navigation';
  import { signOut } from 'firebase/auth';
  import { auth } from '$lib/firebase';

  async function handleSignOut() {
    await signOut(auth);
    goto('/login');
  }
</script>

<button
  onclick={handleSignOut}
  class="border-[3px] border-black rounded-lg bg-[#FF5FA2] px-4 py-2 text-xs font-black uppercase tracking-wide text-white shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] hover:-translate-y-0.5 transition-all"
>
  Sign Out
</button>
