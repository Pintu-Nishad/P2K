const roomPass = window.roomPass;
const sessionId = window.sessionId;
const name = window.userName;

const roomRef = ref(db,"rooms/"+roomPass);
const chatRef = ref(db,"rooms/"+roomPass+"/chat");

// Send message
sendBtn.onclick = ()=>{
    const msg = msgInput.value.trim();
    if(!msg) return;
    push(chatRef,{user:name,msg:msg,time:Date.now()});
    msgInput.value="";
};

// Display chat
onChildAdded(chatRef,(d)=>{
    const li = document.createElement("li");
    li.innerText = d.val().user+": "+d.val().msg;
    chatList.insertBefore(li, chatList.firstChild);
});

// Active users
onValue(ref(db,"rooms/"+roomPass+"/users"), snap=>{
    const users = snap.val();
    if(users){
        usersList.innerText = Object.values(users).map(u=>u.name).join(", ");
    } else usersList.innerText="";
});

// Exit
exitBtn.onclick = ()=>{
    remove(ref(db,"rooms/"+roomPass+"/users/"+sessionId));
    setTimeout(()=>remove(ref(db,"rooms/"+roomPass+"/chat")),60000);
    location.reload();
};
