// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAvE4nx7QK6S3F6RpXY5E7F0tI6dd1DI0Q",
  authDomain: "cpmd-c0233.firebaseapp.com",
  projectId: "cpmd-c0233",
  storageBucket: "cpmd-c0233.appspot.com",
  messagingSenderId: "201203398295",
  appId: "1:201203398295:web:cd2e2dc898bc667bc19bd2",
  measurementId: "G-YPV0TQ9P05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)


export { db, auth, storage };