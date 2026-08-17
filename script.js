const usernameInput = document.getElementById('username-input');
const startBtn = document.getElementById('start-btn');
const welcomeScreen = document.getElementById('welcome-screen');
const mainScreen = document.getElementById('main-screen');
const userBadge = document.getElementById('user-badge');
const badgeId = document.getElementById('badge-id');

usernameInput.addEventListener('input', () => {
    if (usernameInput.value.trim().length > 0) {
        startBtn.classList.add('active');
        startBtn.disabled = false;
    } else {
        startBtn.classList.remove('active');
        startBtn.disabled = true;
    }
});

startBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const userId = 'USR-' + Math.floor(1000 + Math.random() * 9000);

    localStorage.setItem('user_name', username);
    localStorage.setItem('user_id', userId);

    welcomeScreen.classList.remove('active');
    badgeId.innerText = userId;
    userBadge.style.display = 'block';
    mainScreen.classList.add('active');

    registerPlayerOnGitHub(userId, username);
});

function openScreen(screenId) {
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('matches-screen').classList.remove('active');
    document.getElementById('leaderboard-screen').classList.remove('active');
    document.getElementById(screenId).classList.add('active');

    if (screenId === 'leaderboard-screen') {
        loadLeaderboard();
    }
}

// تحميل المباريات والتحقق من الـ Deadline وجلب البيانات من matches.json
async function loadMatches() {
    try {
        const configRes = await fetch('config.json');
        const config = await configRes.json();
        
        const firstMatchTime = new Date(config.first_match_start).getTime();
        const oneHourBefore = firstMatchTime - (60 * 60 * 1000);
        const now = new Date().getTime();

        const deadlineNotice = document.getElementById('deadline-notice');
        let isLocked = now > oneHourBefore;

        if (isLocked) {
            deadlineNotice.innerText = "🔒 انتهى وقت التوقعات (تم إغلاق الأبواب قبل ساعة من المباريات)";
        } else {
            deadlineNotice.innerText = "⏳ متاح التوقع حتى قبل ساعة من انطلاق أول مباراة";
        }

        const matchesRes = await fetch('matches.json');
        const matches = await matchesRes.json();

        const container = document.getElementById('matches-container');
        container.innerHTML = "";

        matches.forEach(m => {
            container.innerHTML += `
            <div class="match-item" id="match-${m.id}">
                <div style="display:flex; justify-content:space-around; align-items:center; margin-bottom:10px;">
                    <div style="text-align:center"><img src="${m.img1}" width="40"><br>${m.home}</div>
                    <div style="font-weight:bold; color:#7b2cbf">VS</div>
                    <div style="text-align:center"><img src="${m.img2}" width="40"><br>${m.away}</div>
                </div>
                <div class="prediction-options">
                    <button class="pred-btn" ${isLocked ? 'disabled' : ''} onclick="selectPrediction(${m.id}, 'home', this)">فوز ${m.home.split(' ')[0]}</button>
                    <button class="pred-btn" ${isLocked ? 'disabled' : ''} onclick="selectPrediction(${m.id}, 'draw', this)">تعادل</button>
                    <button class="pred-btn" ${isLocked ? 'disabled' : ''} onclick="selectPrediction(${m.id}, 'away', this)">فوز ${m.away.split(' ')[0]}</button>
                </div>
                <button class="btn-send-pred" ${isLocked ? 'disabled' : ''} onclick="sendPrediction(${m.id})">إرسال التوقع</button>
            </div>`;
        });
    } catch (e) {
        console.error("خطأ في تحميل المباريات", e);
    }
}

let currentSelections = {};
function selectPrediction(mid, choice, btn) {
    currentSelections[mid] = choice;
    const matchBox = document.getElementById(`match-${mid}`);
    matchBox.querySelectorAll('.pred-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function sendPrediction(mid) {
    if (!currentSelections[mid]) {
        alert('الرجاء اختيار نتيجة أولاً!');
        return;
    }
    const matchBox = document.getElementById(`match-${mid}`);
    matchBox.querySelectorAll('.pred-btn').forEach(b => b.disabled = true);
    const sendBtn = matchBox.querySelector('.btn-send-pred');
    sendBtn.disabled = true;
    sendBtn.innerText = 'تم إرسال توقعك ✓';
    sendBtn.style.background = '#6c757d';

    let userId = localStorage.getItem('user_id');
    let allPreds = JSON.parse(localStorage.getItem('my_predictions') || "{}");
    allPreds[mid] = currentSelections[mid];
    localStorage.setItem('my_predictions', JSON.stringify(allPreds));
}

async function loadLeaderboard() {
    try {
        const res = await fetch('leaderboard.json');
        const data = await res.json();
        let html = "<table width='100%' style='border-collapse: collapse;'><tr><th style='text-align:right; padding:8px;'>الاسم</th><th style='text-align:center; padding:8px;'>النقاط</th></tr>";
        data.forEach(p => {
            html += `<tr style='border-bottom: 1px solid #eee;'><td style='padding:8px;'>${p.name}</td><td style='text-align:center; padding:8px; font-weight:bold; color:#7b2cbf;'>${p.points}</td></tr>`;
        });
        html += "</table>";
        document.getElementById('leaderboard-list').innerHTML = html;
    } catch (e) {
        document.getElementById('leaderboard-list').innerHTML = "<p>تعذر تحميل جدول الترتيب.</p>";
    }
}

function registerPlayerOnGitHub(id, name) {
    let currentLeaderboard = [{id: id, name: name, points: 0}];
    console.log("تم تسجيل اللاعب:", currentLeaderboard);
}

loadMatches();
