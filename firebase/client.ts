import { initializeApp,getApp,getApps } from "firebase/app";
import {getAuth} from 'firebase/auth';
import { getFirestore }from 'firebase/firestore'; 
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSF6ighy1sbSXrwdg4-dX1d6BkvTvxUQQ",
  authDomain: "prepwise-f285b.firebaseapp.com",
  projectId: "prepwise-f285b",
  storageBucket: "prepwise-f285b.firebasestorage.app",
  messagingSenderId: "160395856815",
  appId: "1:160395856815:web:818bccf5261c7a62c73d5a",
  measurementId: "G-CYX8VRQR14"
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
// Initialize Firebase
export const auth=getAuth(app);
export const db=getFirestore(app);