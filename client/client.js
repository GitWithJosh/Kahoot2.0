const socket = new WebSocket('ws://localhost:3000');

let questions = [];
let currentQuestionIndex = 0;
let timer;
const timeLimit = 20; // Time limit for each question in seconds

socket.addEventListener('open', function (event) {
  console.log('Connected to server');
  socket.send('Hello Server!');
});

socket.addEventListener('message', function (event) {
  console.log('Message from server', event.data);
  questions = JSON.parse(event.data);
  showStartPage();
});

document.getElementById('start-button').addEventListener('click', startQuiz);
document.getElementById('next-button').addEventListener('click', () => {
  currentQuestionIndex++;
  setNextQuestion();
});

function showStartPage() {
  document.getElementById('start-page').style.display = 'block';
  document.getElementById('quiz-container').style.display = 'none';
}

function startQuiz() {
  document.getElementById('start-page').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
  currentQuestionIndex = 0;
  setNextQuestion();
}

function setNextQuestion() {
  resetState();
  showQuestion(questions[currentQuestionIndex]);
  startTimer();
}

function showQuestion(question) {
  const questionContainer = document.getElementById('question-container');
  questionContainer.innerText = question.question;

  question.answers.forEach(answer => {
    const button = document.createElement('button');
    button.innerText = answer;
    button.classList.add('btn');
    button.addEventListener('click', () => selectAnswer(button, question.correctAnswer));
    document.getElementById('answer-buttons').appendChild(button);
  });
}

function resetState() {
  clearInterval(timer);
  document.getElementById('next-button').style.display = 'none';
  while (document.getElementById('answer-buttons').firstChild) {
    document.getElementById('answer-buttons').removeChild(document.getElementById('answer-buttons').firstChild);
  }
}

function selectAnswer(button, correctAnswer) {
  clearInterval(timer); // Stop timer when an answer is selected
  const selectedButton = button;
  if (selectedButton.innerText === correctAnswer) {
    selectedButton.classList.add('correct');
  } else {
    selectedButton.classList.add('incorrect');
  }
  Array.from(document.getElementById('answer-buttons').children).forEach(button => {
    button.disabled = true;
  });
  if (currentQuestionIndex < questions.length - 1) {
    document.getElementById('next-button').style.display = 'block';
  } else {
    document.getElementById('next-button').innerText = 'Quiz beenden';
    document.getElementById('next-button').addEventListener('click', () => location.reload());
    document.getElementById('next-button').style.display = 'block';
  }
}

function startTimer() {
  let timeLeft = timeLimit;
  const timerElement = document.getElementById('timer');
  timerElement.style.display = 'block';
  timerElement.innerText = `Zeit: ${timeLeft} Sekunden`;

  timer = setInterval(() => {
    timeLeft--;
    timerElement.innerText = `Zeit: ${timeLeft} Sekunden`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
        setNextQuestion();
      } else {
        timerElement.innerText = 'Quiz beendet!';
        document.getElementById('next-button').innerText = 'Quiz beenden';
        document.getElementById('next-button').addEventListener('click', () => location.reload());
        document.getElementById('next-button').style.display = 'block';
      }
    }
  }, 1000);
}
