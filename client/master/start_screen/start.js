document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('quizForm');
    
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Verhindert das Standardformularverhalten
            // Redirect to master start screen
            window.location.href = '/master/start_screen/waiting.html';
            createGame();
        });
    } else {
        console.error('Konnte kein Spiel erstellen.');
    }
});

function createGame() {
    // Create game room as master
    fetch(`/master/create_game`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        alert(data.message);
      }
    })
    .catch(error => console.error('Error creating game:', error));
  }