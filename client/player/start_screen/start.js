document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('quizForm');
    
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Verhindert das Standardformularverhalten

            var username = document.getElementById('username').value;

            // Speichere den Benutzernamen im localStorage
            localStorage.setItem('username', username);

            console.log('Username gespeichert:', username);

            // Leite auf die waiting.html-Seite weiter
            //window.location.href = '/player/start_screen/waiting.html';
            joinGame();
        });
    }
});

function joinGame() {
    // Join game room as player
    console.log('Joining game as player');
    playerName = localStorage.getItem('username');
    fetch(`/player/join_game`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: playerName })
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        alert(data.message);
      }
      playerId = data.id; // Set player id created by server
    })
    .catch(error => console.error('Error joining game:', error));
  }