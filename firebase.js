// firebase.js
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCN93gO0q-J-UutNycGZDP9Upl2viwKHbU",
  authDomain: "wastemanagementapp-a5341.firebaseapp.com",
  projectId: "wastemanagementapp-a5341",
  storageBucket: "wastemanagementapp-a5341.appspot.com",
  messagingSenderId: "260426285125",
  appId: "1:260426285125:web:0f5f9cddd9dc4451ffa32c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with error handling
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log("Firebase Auth initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase Auth:", error);
  // Fallback to default auth if initialization fails
  const { getAuth } = require("firebase/auth");
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);
console.log("Firebase Firestore initialized successfully");

export { auth, db };