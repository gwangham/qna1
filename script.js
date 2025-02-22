// Firebase 구성
const firebaseConfig = {
    apiKey: "AIzaSyAG_T9J-qOZpR6dJBvq-xsez7f1_MxO0wI",
    authDomain: "qna2-a5a19.firebaseapp.com",
    projectId: "qna2-a5a19",
    storageBucket: "qna2-a5a19.firebasestorage.app",
    messagingSenderId: "1026913703737",
    appId: "1:1026913703737:web:150d101dd5add847967ae8",
    measurementId: "G-5QGNS5KFBD"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// 인증 상태 관찰자
auth.onAuthStateChanged((user) => {
    if (user) {
        // 로그인 상태
        document.getElementById('authForm').style.display = 'none';
        document.getElementById('userStatus').style.display = 'flex';
        document.getElementById('userEmail').textContent = user.email;
    } else {
        // 로그아웃 상태
        document.getElementById('authForm').style.display = 'block';
        document.getElementById('userStatus').style.display = 'none';
    }
    // questionForm은 항상 표시
    document.getElementById('questionForm').style.display = 'block';
});

// 로그인 함수
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        alert('로그인 실패: ' + error.message);
    }
}

// 회원가입 함수
async function signup() {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        await auth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
        alert('회원가입 실패: ' + error.message);
    }
}

// 로그아웃 함수
function logout() {
    auth.signOut();
}

// 폼 전환 함수들
function showSignupForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
}

// 질문 제출 함수
async function submitQuestion() {
    const subject = document.getElementById('subject').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    if (!subject || !title || !content) {
        alert('모든 필드를 입력해주세요!');
        return;
    }

    const question = {
        subject,
        title,
        content,
        answers: [],
        date: new Date().toLocaleString(),
        // 로그인한 사용자의 경우에만 사용자 정보 추가
        ...(auth.currentUser && {
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email
        })
    };

    try {
        await db.collection('questions').add(question);
        clearForm();
        loadQuestions();
    } catch (error) {
        console.error("Error adding question: ", error);
        alert('질문 등록 중 오류가 발생했습니다.');
    }
}

// 답변 추가 함수
async function submitAnswer(questionId) {
    const answerContent = document.getElementById(`answer-${questionId}`).value;
    
    if (!answerContent) {
        alert('답변 내용을 입력해주세요!');
        return;
    }

    const answer = {
        content: answerContent,
        date: new Date().toLocaleString(),
        // 로그인한 사용자의 경우에만 사용자 정보 추가
        ...(auth.currentUser && {
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email
        })
    };

    try {
        const questionRef = db.collection('questions').doc(questionId);
        await questionRef.update({
            answers: firebase.firestore.FieldValue.arrayUnion(answer)
        });
        loadQuestions();
    } catch (error) {
        console.error("Error adding answer: ", error);
        alert('답변 등록 중 오류가 발생했습니다.');
    }
}

// 질문 목록 불러오기
async function loadQuestions() {
    try {
        const snapshot = await db.collection('questions').orderBy('date', 'desc').get();
        const questions = [];
        snapshot.forEach(doc => {
            questions.push({ id: doc.id, ...doc.data() });
        });
        renderQuestions(questions);
    } catch (error) {
        console.error("Error loading questions: ", error);
        alert('질문 목록을 불러오는 중 오류가 발생했습니다.');
    }
}

// 질문 목록 렌더링
function renderQuestions(questions) {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = questions.map(question => `
        <div class="question-card">
            <div class="question-subject">${question.subject}</div>
            <div class="question-title">${question.title}</div>
            <div class="question-content">${question.content}</div>
            <div class="question-date">${question.date}</div>
            ${question.userEmail ? `<div class="question-author">작성자: ${question.userEmail}</div>` : ''}
            
            <div class="answers">
                ${question.answers.map(answer => `
                    <div class="answer">
                        <div>${answer.content}</div>
                        <div class="answer-date">${answer.date}</div>
                        ${answer.userEmail ? `<div class="answer-author">답변자: ${answer.userEmail}</div>` : ''}
                    </div>
                `).join('')}
                
                <div class="answer-form">
                    <textarea id="answer-${question.id}" placeholder="답변을 작성해주세요"></textarea>
                    <button onclick="submitAnswer('${question.id}')">답변 등록</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 폼 초기화
function clearForm() {
    document.getElementById('subject').value = '';
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
}

// 페이지 로드 시 질문 목록 불러오기
window.onload = loadQuestions;
