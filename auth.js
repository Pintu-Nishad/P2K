import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

// Firebase config
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
export const db = getDatabase(app);

let name, pass;
let sessionId;

const loginBox = document.getElementById("loginBox");
const chatBox = document.getElementById("chatBox");
const enterBtn = document.getElementById("enterBtn");
const roomDisplay = document.getElementById("roomDisplay");

enterBtn.onclick = ()=>{
    name = document.getElementById("name").value.trim();
    pass = document.getElementById("pass").value.trim();

    if(!name){alert("Enter name"); return;}
    if(!pass.match(/^[A-Za-z]+$/)){alert("Password letters only"); return;}

    sessionId = Date.now().toString(36); // unique session id

    // Add user to DB
    set(ref(db,"rooms/"+pass+"/users/"+sessionId),{name:name,time:Date.now()});

    // Show chat
    loginBox.classList.add("hidden");
    chatBox.classList.remove("hidden");
    roomDisplay.innerText = pass;
};
