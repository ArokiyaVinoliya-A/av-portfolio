
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyATnG5yF_rFQEASrzPT5WipGuJBA6ZAp6M",
  authDomain: "arokiya-portfolio.firebaseapp.com",
  projectId: "arokiya-portfolio",
  storageBucket: "arokiya-portfolio.firebasestorage.app",
  messagingSenderId: "430031483704",
  appId: "1:430031483704:web:5825e71040abb807c4c7cd"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);
export const storage = getStorage(app);

export { app, auth, db };