const firebaseConfig = { 
    apiKey: "AIzaSyDMJHzj0g_sRYW2exwyVLZZs4Y_hnnrDNM", 
    authDomain: "p2kc-b0553.firebaseapp.com", 
    databaseURL: "https://p2kc-b0553-default-rtdb.firebaseio.com", 
    projectId: "p2kc-b0553" 
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let myName, myRoom, localStream, peerConnection, currentFacingMode="user", isFlash=false;

function enter(){
    myName = document.getElementById('user').value.trim(); 
    myRoom = document.getElementById('pass').value.trim();
    if(!myName || !myRoom) return;
    document.getElementById('loginDiv').style.display="none"; 
    document.getElementById('chatDiv').classList.remove('hidden');
    document.getElementById('roomTitle').innerText = "ID: " + myRoom;
    db.ref(`rooms/${myRoom}/users/${myName}`).set(true);
    db.ref(`rooms/${myRoom}/users`).on('value', s => document.getElementById('userCounter').innerText = "Online: " + s.numChildren());
    listenMsgs(); listenCall();
}

function sendMsg(){
    const inp = document.getElementById('msgInput');
    if(!inp.value.trim()) return;
    const ref = db.ref(`rooms/${myRoom}/msgs`).push({ u: myName, val: inp.value, type: 'text', time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) });
    if(document.getElementById('ghostMode').checked) setTimeout(() => ref.remove(), 30000);
    inp.value="";
}

function sendPhoto(input) {
    if (!input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
        const ref = db.ref(`rooms/${myRoom}/msgs`).push({ u: myName, val: e.target.result, type: 'image', time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) });
        if(document.getElementById('ghostMode').checked) setTimeout(() => ref.remove(), 30000);
    };
    reader.readAsDataURL(input.files[0]);
}

function listenMsgs(){
    db.ref(`rooms/${myRoom}/msgs`).on("child_added", s=>{
        let d = s.val(), id = s.key;
        let div = document.createElement("div");
        div.className = "msg" + (d.u == myName ? " my-msg" : "");
        let content = d.type === 'image' ? `<img src="${d.val}" onclick="document.getElementById('zoomImg').src='${d.val}'; document.getElementById('zoomOverlay').style.display='flex'">` : `<div>${d.val}</div>`;
        div.innerHTML = `<div class="text-[9px] text-[#00a884] font-bold uppercase">${d.u}</div>${content}<div class="text-[7px] opacity-40 text-right">${d.time}</div>`;
        document.getElementById('chatBox').appendChild(div);
        document.getElementById('chatBox').scrollTop = document.getElementById('chatBox').scrollHeight;
    });
}

// Call Logic
async function startCall(){
    document.getElementById('callUI').style.display = "block";
    localStream = await navigator.mediaDevices.getUserMedia({ audio:true, video: { facingMode: "user" } });
    document.getElementById('localVideo').srcObject = localStream;
    setupPeer();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    db.ref(`calls/${myRoom}`).set({ offer:offer, caller:myName });
}

function setupPeer(){
    peerConnection = new RTCPeerConnection({ iceServers:[{urls:"stun:stun.l.google.com:19302"}] });
    localStream.getTracks().forEach(t => peerConnection.addTrack(t, localStream));
    peerConnection.ontrack = e => { document.getElementById('remoteVideo').srcObject = e.streams[0]; };
    peerConnection.onicecandidate = e => { if(e.candidate) db.ref(`calls/${myRoom}/candidates/${myName}`).push(e.candidate.toJSON()); };
}

function listenCall(){
    db.ref(`calls/${myRoom}`).on("value", async snap=>{
        let d = snap.val();
        if(!d) { if(peerConnection) endCall(); return; }
        if(d.offer && d.caller !== myName && !peerConnection) {
            if(confirm("Video Call from " + d.caller)) {
                document.getElementById('callUI').style.display="block";
                localStream = await navigator.mediaDevices.getUserMedia({ audio:true, video:true });
                document.getElementById('localVideo').srcObject = localStream;
                setupPeer();
                await peerConnection.setRemoteDescription(new RTCSessionDescription(d.offer));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                db.ref(`calls/${myRoom}`).update({answer:answer});
            }
        }
        if(d.answer && d.caller === myName) await peerConnection.setRemoteDescription(new RTCSessionDescription(d.answer));
    });
    db.ref(`calls/${myRoom}/candidates`).on("child_added", s => {
        if(s.key !== myName) s.ref.on("child_added", c => { if(peerConnection) peerConnection.addIceCandidate(new RTCIceCandidate(c.val())); });
    });
}

function endCall(){ 
    db.ref(`calls/${myRoom}`).remove(); 
    if(localStream) localStream.getTracks().forEach(t => t.stop()); 
    if(peerConnection) peerConnection.close(); 
    peerConnection = null; document.getElementById('callUI').style.display = "none"; 
}

async function toggleFlash() {
    const track = localStream.getVideoTracks()[0];
    isFlash = !isFlash;
    track.applyConstraints({ advanced: [{ torch: isFlash }] }).catch(e => alert("Flash Error"));
}

async function switchCamera() {
    currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
    const track = localStream.getVideoTracks()[0]; track.stop();
    const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacingMode } });
    const newTrack = newStream.getVideoTracks()[0];
    peerConnection.getSenders().find(s => s.track.kind === 'video').replaceTrack(newTrack);
    localStream.removeTrack(track); localStream.addTrack(newTrack);
    document.getElementById('localVideo').srcObject = localStream;
}
