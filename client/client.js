const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', function (event) {
  console.log('Connected to server');
  socket.send('Hello Server!');
});

socket.addEventListener('message', function (event) {
  console.log('Message from server', event.data);
  const questions = JSON.parse(event.data);
  displayQuiz(questions);
});

function displayQuiz(questions) {
  const quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = ''; // Clear previous content
  questions.forEach((question, index) => {
    const questionElement = document.createElement('div');
    questionElement.classList.add('question');
    questionElement.innerHTML = `<p>${index + 1}. ${question.question}</p>`;
    question.answers.forEach(answer => {
      const answerButton = document.createElement('button');
      answerButton.textContent = answer;
      answerButton.addEventListener('click', () => checkAnswer(answerButton, question.correctAnswer));
      questionElement.appendChild(answerButton);
    });
    quizContainer.appendChild(questionElement);
  });
}

function checkAnswer(button, correctAnswer) {
  if (button.textContent === correctAnswer) {
    button.classList.add('correct');
  } else {
    button.classList.add('incorrect');
  }
  // Disable all buttons for this question
  const buttons = button.parentNode.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.disabled = true;
  });
}
