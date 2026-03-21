// 1. Photo Preview ka Modal (Screen par pop-up) banana
function setupPhotoPreview() {
    const html = `
        <div id="imgModal" class="hidden fixed inset-0 z-[5000] bg-black/90 flex items-center justify-center p-4" onclick="closeFullImg()">
            <img id="fullImg" src="" class="max-w-full max-h-full object-contain transition-transform duration-300">
        </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
}

// 2. Photo badi karne ka logic
function openFullImg(src) {
    const modal = document.getElementById('imgModal');
    const img = document.getElementById('fullImg');
    img.src = src;
    modal.classList.remove('hidden');
}

// 3. Photo band karne ka logic
function closeFullImg() {
    document.getElementById('imgModal').classList.add('hidden');
}

// 4. Typing Status ka logic
function listenTyping() {
    const input = document.getElementById('msgInput');
    input.addEventListener('input', () => {
        db.ref(`rooms/${myRoom}/typing/${myName}`).set(true);
        clearTimeout(window.tType);
        window.tType = setTimeout(() => db.ref(`rooms/${myRoom}/typing/${myName}`).remove(), 2000);
    });

    db.ref(`rooms/${myRoom}/typing`).on('value', s => {
        let names = [];
        s.forEach(u => { if(u.key !== myName) names.push(u.key); });
        // Header mein typing dikhayega
        document.getElementById('userCounter').innerText = names.length > 0 ? names.join(',') + " typing..." : "● Online";
    });
}

// Start features
setupPhotoPreview();
