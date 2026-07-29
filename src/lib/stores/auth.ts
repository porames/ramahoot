import { writable } from 'svelte/store';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { browser } from '$app/environment';
import { auth } from '$lib/firebase';

export const teacher = writable<User | null>(null);
export const authReady = writable(false);

if (browser) {
  onAuthStateChanged(auth, (user) => {
    teacher.set(user);
    authReady.set(true);
  });
}
