document.addEventListener('DOMContentLoaded', function () {
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
    startQuiz();
  });

  document.querySelector('.skip button').addEventListener('click', skipQuestion);

  function startQuiz() {
    setNextQuestion();
  }

  function setNextQuestion() {
    resetState();
    if (currentQuestionIndex < questions.length) {
      showQuestion(questions[currentQuestionIndex]);
      startTimer();
    } else {
      console.log('Quiz ended!');
    }
  }

  function showQuestion(question) {
    document.querySelector('.question p').innerText = question.question;
    document.querySelector('.timer text').innerText = timeLimit; // Initial timer display

    const answerContainer = document.querySelector('.answer-container');
    question.answers.forEach((answer, index) => {
      const answerButton = document.createElement('button');
      answerButton.innerText = answer;
      answerButton.classList.add('answer-button');
      answerButton.dataset.index = index; // Store answer index for checking correctness

      // Apply button color class based on index (assuming index corresponds to your color classes)
      switch (index) {
        case 0:
          answerButton.classList.add('red');
          break;
        case 1:
          answerButton.classList.add('blue');
          break;
        case 2:
          answerButton.classList.add('yellow');
          break;
        case 3:
          answerButton.classList.add('green');
          break;
        default:
          answerButton.classList.add('blue'); // Default color for any additional answers
          break;
      }

      answerButton.addEventListener('click', () => selectAnswer(answerButton, question.correctAnswer));
      answerContainer.appendChild(answerButton);
    });
  }

  function resetState() {
    clearInterval(timer);
    const answerContainer = document.querySelector('.answer-container');
    while (answerContainer.firstChild) {
      answerContainer.removeChild(answerContainer.firstChild);
    }
    document.querySelector('.correct')?.classList.remove('correct');
    document.querySelector('.incorrect')?.classList.remove('incorrect');
  }

  function selectAnswer(answerButton, correctAnswer) {
    clearInterval(timer);

    if (answerButton) {
      answerButton.disabled = true; // Disable the selected button

      if (answerButton.innerText === correctAnswer) {
        answerButton.classList.add('correct');
      } else {
        answerButton.classList.add('incorrect');
        // Optionally, you can highlight the correct answer here
        document.querySelectorAll('.answer-button').forEach(button => {
          if (button.innerText === correctAnswer) {
            button.classList.add('correct');
          }
        });
      }
    }

    // Remove all other answer buttons
    document.querySelectorAll('.answer-button').forEach(button => {
      if (button !== answerButton) {
        button.remove();
      }
      // Make selected answer button default color
      button.classList.remove('red', 'blue', 'yellow', 'green');
    });

    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        currentQuestionIndex++;
        setNextQuestion();
      }, 1000); // Move to next question after 1 second
    } else {
      // End of quiz logic
      setTimeout(() => {
        alert('Quiz ended!');
        location.reload(); // Reload page to restart quiz
      }, 2000);
    }
  }

  function skipQuestion() {
    clearInterval(timer);
    currentQuestionIndex++;
    setNextQuestion();
  }

  function startTimer() {
    let timeLeft = timeLimit;
    const timerElement = document.querySelector('.timer text');
    
    // Function to update the timer display
    function updateTimerDisplay() {
      timerElement.textContent = timeLeft;
    }
    
    // Initial update of the timer display
    updateTimerDisplay();
    
    // Interval to countdown every second
    timer = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        selectAnswer(null, questions[currentQuestionIndex].correctAnswer); // Auto-select correct answer if time runs out
      }
    }, 1000);
  }  
});
