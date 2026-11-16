import { initializeApp } from 'firebase/app'
import {
  initializeAuth,
  browserLocalPersistence,
  connectAuthEmulator,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDrsXtaNOHI21rsHZyEbbOHrvJPtHP-8p4',
  authDomain: 'voit-81841.firebaseapp.com',
  projectId: 'voit-81841',
  storageBucket: 'voit-81841.firebasestorage.app',
  messagingSenderId: '909746869217',
  appId: '1:909746869217:web:b54311590a5ec441b7b8a0',
}

const app = initializeApp(firebaseConfig)

// Use localStorage instead of IndexedDB — IndexedDB hangs silently on iOS WebKit
export const firebaseAuth = initializeAuth(app, {
  persistence: [browserLocalPersistence],
})

// Local dev: sign in against the Firebase Auth Emulator (the one the API and
// its seed use) instead of the real project. Unset in production.
const authEmulatorUrl = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL
if (authEmulatorUrl) {
  connectAuthEmulator(firebaseAuth, authEmulatorUrl, { disableWarnings: true })
}
