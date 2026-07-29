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
  class="text-red-500 text-sm hover:text-red-600 transition"
>
  Sign Out
</button>
