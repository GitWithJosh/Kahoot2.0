const serverUrl = 'http://localhost:3000';
let questions = [];
let currentQuestionIndex = 0;
let timer;
let playerName; // player name
let playerId; // player id
let intervalId; // interval id for timer
const timeLimit = 30; // Time limit for each question in seconds

document.addEventListener('DOMContentLoaded', function () {
  const socket = new WebSocket('ws://localhost:3000');

  socket.onopen = () => {
    console.log('WebSocket Client Connected');
  };
  
  socket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.type === 'next-question') {
      // Display question and answers to player as well as start timer
      document.getElementById('question').innerText = data.question.question;
      for (let i = 0; i < data.question.answers.length; i++) {
        document.getElementById(`answer${i}`).innerText = data.question.answers[i]; // Eventually replace to match with HTML Requirements
      }
      // Increase Question Index
      currentQuestionIndex++;
      timer = timeLimit;
      document.getElementById('timer').innerText = timer;
      clearInterval(intervalId); // Clear previous interval
      intervalId = setInterval(() => {
        // count down timer
        timer--;
        document.getElementById('timer').innerText = timer;
        if (timer === 0) {
          clearInterval(intervalId);
        }
      }, 1000); // 1 second
    }
      
  };

  // TODO Implement logic to handle html elements
});

function uploadQuestions() {
  // Allow user to upload questions file
  // Read file from input 
  const file = document.getElementById('file').files[0];
  const reader = new FileReader();
  reader.onload = function(event) {
    questions = JSON.parse(event.target.result);
  };
  reader.readAsText(file);

  // Send questions to server
  fetch(`${serverUrl}/master/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(questions)
  })
  .then(response => response.json())
  .then(data => {
    if (data.message) {
      alert(data.message);
    }
  })
}

function startGame() {
  // Start the game
  fetch(`${serverUrl}/master/start_game`, {
    method: 'POST'
  })
  .then(response => response.json())
  .then(data => {
    if (data.message) {
      alert(data.message);
    }
  })
  .catch(error => console.error('Error starting game:', error));
}

function updateScore() {
  // Update player score in server's JSON file
  fetch(`${serverUrl}/player/score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: playerId, score: 10 }) // Placeholder score
  })
  .then(response => response.json())
  .then(data => {
    if (data.message) {
      alert(data.message);
    }
  })
  .catch(error => console.error('Error updating score:', error));

  // Load waiting screen
  // TODO: Add waiting screen
}

function endGame() {
  // End the game and clear the room
  fetch(`${serverUrl}/master/end_game`, {
    method: 'POST'
  })
  .then(response => response.json())
  .then(data => {
    if (data.message) {
      alert(data.message);
    }
  })
  .catch(error => console.error('Error ending game:', error));
}