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
            window.location.href = 'waiting.html';
        });
    } else {
        console.error('Formular mit der ID "quizForm" wurde nicht gefunden.');
    }
});
