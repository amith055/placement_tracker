import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { get } from "http";

const firebaseConfig = {
  apiKey: "AIzaSyDigHQl14cHYZtOg0Qmx_3l5QfS62ABgIM",
  authDomain: "studio-9726164399-48ba7.firebaseapp.com",
  databaseURL: "https://studio-9726164399-48ba7-default-rtdb.firebaseio.com",
  projectId: "studio-9726164399-48ba7",
  storageBucket: "studio-9726164399-48ba7.firebasestorage.app",
  messagingSenderId: "139025792367",
  appId: "1:139025792367:web:7661d5cb1611884bd83c9a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db=getFirestore(app);