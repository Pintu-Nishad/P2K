import { db } from './auth.js';
import { ref, push, onChildAdded, onChildRemoved, remove, onValue } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

const sendBtn = document.getElementById("sendBtn");
const msgInput = document.getElementById("msgInput");
const chatList = document.getElementById("chatList");
const usersList = document.getElementById("usersList");
const exitBtn = document.getElementById("exitBtn");

// Get room and sessionId from auth.js
import { name, pass, sessionId } from './auth.js';
const roomRef = ref(db,"rooms/"+pass);
const chatRef = ref(db,"rooms/"+pass+"/chat");

sendBtn.onclick = ()=>{
    const msg = msgInput.value.trim();
    if(!msg) return;
    push(chatRef,{user:name,msg:msg,time:Date.now()});
    msgInput.value="";
};

// Display chat
onChildAdded(chatRef, (d)=>{
    const li = document.createElement("li");
    li.innerText = d.val().user+": "+d.val().msg;
    chatList.insertBefore(li, chatList.firstChild);
});

// Active users list
onValue(ref(db,"rooms/"+pass+"/users"), snap=>{
    const users = snap.val();
    if(users){
        usersList.innerText = Object.values(users).map(u=>u.name).join(", ");
    } else usersList.innerText="";
});

// Exit button
exitBtn.onclick = ()=>{
    remove(ref(db,"rooms/"+pass+"/users/"+sessionId));
    // Delete chat after 1 min
    setTimeout(()=>remove(ref(db,"rooms/"+pass+"/chat")),60000);
    location.reload();
};
