import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBg3vKh7SHd-r39AOkIF9630rHYXq9P4Yw",
  authDomain: "batteryh-4a25c.firebaseapp.com",
  projectId: "batteryh-4a25c",
  storageBucket: "batteryh-4a25c.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);