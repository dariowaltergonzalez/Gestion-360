import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDN3ij5MaK0TwNIIP_aXPObEMdP86ZooiI",
  authDomain: "gestion-360-b1a0b.firebaseapp.com",
  projectId: "gestion-360-b1a0b",
  storageBucket: "gestion-360-b1a0b.firebasestorage.app",
  messagingSenderId: "313895637498",
  appId: "1:313895637498:web:9bb03313308bc108af1443"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
