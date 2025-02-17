// 질문들을 저장할 배열
let questions = [];

// 질문 제출 함수
function submitQuestion() {
    const subject = document.getElementById('subject').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    if (!subject || !title || !content) {
        alert('모든 필드를 입력해주세요!');
        return;
    }

    const question = {
        id: Date.now(),
        subject,
        title,
        content,
        answers: [],
        date: new Date().toLocaleString()
    };

    questions.unshift(question);
    saveQuestions();
    renderQuestions();
    clearForm();
}

// 답변 추가 함수
function submitAnswer(questionId) {
    const answerContent = document.getElementById(`answer-${questionId}`).value;
    
    if (!answerContent) {
        alert('답변 내용을 입력해주세요!');
        return;
    }

    const answer = {
        id: Date.now(),
        content: answerContent,
        date: new Date().toLocaleString()
    };

    const questionIndex = questions.findIndex(q => q.id === questionId);
    questions[questionIndex].answers.push(answer);
    
    saveQuestions();
    renderQuestions();
}

// 질문 목록 렌더링
function renderQuestions() {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = questions.map(question => `
        <div class="question-card">
            <div class="question-subject">${question.subject}</div>
            <div class="question-title">${question.title}</div>
            <div class="question-content">${question.content}</div>
            <div class="question-date">${question.date}</div>
            
            <div class="answers">
                ${question.answers.map(answer => `
                    <div class="answer">
                        <div>${answer.content}</div>
                        <div class="answer-date">${answer.date}</div>
                    </div>
                `).join('')}
                
                <div class="answer-form">
                    <textarea id="answer-${question.id}" placeholder="답변을 작성해주세요"></textarea>
                    <button onclick="submitAnswer(${question.id})">답변 등록</button>
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

// localStorage에 질문 저장
function saveQuestions() {
    localStorage.setItem('questions', JSON.stringify(questions));
}

// localStorage에서 질문 불러오기
function loadQuestions() {
    const saved = localStorage.getItem('questions');
    if (saved) {
        questions = JSON.parse(saved);
        renderQuestions();
    }
}

// 페이지 로드 시 저장된 질문 불러오기
window.onload = loadQuestions;
