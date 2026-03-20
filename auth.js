enterBtn.onclick = ()=>{
    name = document.getElementById("name").value.trim();
    pass = document.getElementById("pass").value.trim();

    if(!name){alert("Enter name"); return;}
    if(!pass.match(/^[A-Za-z]+$/)){alert("Password letters only"); return;}

    sessionId = Date.now().toString(36); // unique session id

    // Save to window so chat.js can access
    window.userName = name;
    window.roomPass = pass;
    window.sessionId = sessionId;

    // Add user to DB
    set(ref(db,"rooms/"+pass+"/users/"+sessionId),{name:name,time:Date.now()});

    // Show chat
    loginBox.classList.add("hidden");
    chatBox.classList.remove("hidden");
    roomDisplay.innerText = pass;
};
