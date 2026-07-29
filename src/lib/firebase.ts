import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBAoSmhhdEMoD5y0_qkUHDQPDcNQUkoJuA',
  authDomain: 'ramahoot-app.firebaseapp.com',
  projectId: 'ramahoot-app',
  storageBucket: 'ramahoot-app.firebasestorage.app',
  messagingSenderId: '707335319294',
  appId: '1:707335319294:web:1071d87e25adee5e06bfaf'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
export const googleProvider = new GoogleAuthProvider();
