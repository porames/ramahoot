import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '$lib/firebase';

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function uniqueCode(): Promise<string> {
  let code = generateCode();
  let attempts = 0;

  while (attempts < 10) {
    const q = query(collection(db, 'sessions'), where('code', '==', code));
    const snap = await getDocs(q);
    if (snap.empty) return code;
    code = generateCode();
    attempts++;
  }

  throw new Error('Failed to generate unique code after 10 attempts');
}
