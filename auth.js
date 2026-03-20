import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDMJHzj0g_sRYW2exwyVLZZs4Y_hnnrDNM",
  authDomain: "p2kc-b0553.firebaseapp.com",
  databaseURL: "https://p2kc-b0553-default-rtdb.firebaseio.com",
  projectId: "p2kc-b0553",
  storageBucket: "p2kc-b0553.appspot.com",
  messagingSenderId: "939347031406",
  appId: "1:939347031406:web:998f52b262a0cecf11bd7f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export let name, roomId, confirmationResult;

const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyBtn = document.getElementById("verifyBtn");

window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {'size':'invisible'}, auth);

sendOtpBtn.onclick = ()=>{
    name = document.getElementById("name").value.trim();
    roomId = document.getElementById("room").value.trim();
    const phone = document.getElementById("phone").value.trim();
    if(name.length<4){alert("Name min 4 letters"); return;}
    if(!roomId){alert("Enter room"); return;}
    if(!phone){alert("Enter phone"); return;}
    
    signInWithPhoneNumber(auth, phone, window.recaptchaVerifier)
    .then(result=>{
        confirmationResult = result;
        alert("OTP sent ✓");
        document.getElementById("otp").classList.remove("hidden");
        verifyBtn.classList.remove("hidden");
    }).catch(err=>{alert(err.message)});
};

verifyBtn.onclick = ()=>{
    const otp = document.getElementById("otp").value.trim();
    confirmationResult.confirm(otp)
    .then(resp=>{
        alert("Phone verified ✓");
        document.getElementById("menu").classList.add("hidden");
        document.getElementById("chatBox").classList.remove("hidden");
        set(ref(db,"users/"+roomId+"/"+name),true);
        document.getElementById("roomDisplay").innerText = roomId;
    }).catch(err=>alert("Wrong OTP"));
};