import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDrsXtaNOHI21rsHZyEbbOHrvJPtHP-8p4',
  authDomain: 'voit-81841.firebaseapp.com',
  projectId: 'voit-81841',
  storageBucket: 'voit-81841.firebasestorage.app',
  messagingSenderId: '909746869217',
  appId: '1:909746869217:web:b54311590a5ec441b7b8a0',
}

const app = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(app)
