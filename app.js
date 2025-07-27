// app.js - Optimized Firebase Auth Logic
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAAvju1WhBQZzzdEcgo6v7GPjccLX-5e5Q",
  authDomain: "signup-9ca8a.firebaseapp.com",
  projectId: "signup-9ca8a",
  storageBucket: "signup-9ca8a.appspot.com",
  messagingSenderId: "302779043389",
  appId: "1:302779043389:web:19cac56a7a0868d55b2454",
  measurementId: "G-CCX3P6FHFK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// DOM Cache
const dom = {
  authForm: document.getElementById("authForm"),
  formTitle: document.getElementById("formTitle"),
  submitBtn: document.getElementById("submitBtn"),
  toggleText: document.getElementById("toggleText"),
  toggleMode: document.getElementById("toggleMode"),
  nameField: document.getElementById("name"),
  mobileField: document.getElementById("mobile"),
  passwordField: document.getElementById("password"),
  confirmField: document.getElementById("confirmPassword"),
  passwordError: document.getElementById("passwordError"),
  userInfo: document.getElementById("userInfo"),
  authBox: document.getElementById("authBox"),
  googleBtn: document.getElementById("googleBtn"),
  logoutBtn: document.getElementById("logoutBtn")
};

let isLogin = false;

// Optimized Toggle Function
function toggleForm() {
  isLogin = !isLogin;
  
  // Update UI
  dom.formTitle.textContent = isLogin ? "Login" : "Sign Up";
  dom.submitBtn.textContent = isLogin ? "Login" : "Sign Up";
  
  // Toggle fields
  document.querySelectorAll('.signup-only').forEach(el => {
    el.style.display = isLogin ? "none" : "block";
  });
  
  // Clear fields
  dom.passwordField.value = '';
  if (!isLogin) dom.confirmField.value = '';
  dom.passwordError.style.display = "none";
}

// Form Submission Handler
async function handleAuth(e) {
  e.preventDefault();
  
  // Button loading state
  dom.submitBtn.disabled = true;
  const originalBtnText = dom.submitBtn.textContent;
  dom.submitBtn.textContent = "Processing...";
  
  const email = document.getElementById("email").value.trim();
  const password = dom.passwordField.value.trim();

  try {
    if (isLogin) {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      const name = dom.nameField.value.trim();
      const mobile = dom.mobileField.value.trim();
      const confirm = dom.confirmField.value.trim();
      
      if (password !== confirm) {
        dom.passwordError.style.display = "block";
        throw new Error("Passwords don't match");
      }
      
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCred.user.uid), { name, email, mobile });
      toggleForm();
    }
  } catch (err) {
    console.error("Auth error:", err);
    alert(err.message);
  } finally {
    dom.submitBtn.disabled = false;
    dom.submitBtn.textContent = originalBtnText;
  }
}

// Initialize App
function init() {
  // Event Listeners
  dom.authForm.addEventListener("submit", handleAuth);
  dom.toggleMode.addEventListener("click", (e) => {
    e.preventDefault();
    toggleForm();
  });
  
  dom.googleBtn.addEventListener("click", async () => {
    dom.googleBtn.disabled = true;
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName || "",
          email: user.email || "",
          mobile: ""
        });
      }
    } catch (err) {
      console.error("Google signin error:", err);
      alert(err.message);
    } finally {
      dom.googleBtn.disabled = false;
    }
  });
  
  dom.logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
  });
  
  // Auth State Observer
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        dom.userInfo.style.display = "block";
        document.getElementById("userName").textContent = data.name || "User";
        document.getElementById("userEmail").textContent = data.email || "";
        document.getElementById("userMobile").textContent = data.mobile || "";
        dom.authBox.style.display = "none";
      }
    } else {
      dom.userInfo.style.display = "none";
      dom.authBox.style.display = "block";
    }
    
  });
}

// Start the app
document.addEventListener("DOMContentLoaded", init);
