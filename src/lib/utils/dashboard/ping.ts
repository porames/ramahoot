import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '$lib/firebase';

export function startPing(sessionId: string): () => void {
  updateDoc(doc(db, 'sessions', sessionId), {
    lastPing: serverTimestamp()
  }).catch(console.log);

  const interval = window.setInterval(() => {
    updateDoc(doc(db, 'sessions', sessionId), {
      lastPing: serverTimestamp()
    }).catch(console.log);
  }, 60000);

  return () => clearInterval(interval);
}
