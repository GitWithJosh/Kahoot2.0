document.addEventListener('DOMContentLoaded', () => {
    const timerText = document.querySelector('.timer text');
    let timeLeft = 30;
    
    const countdown = setInterval(() => {
        timeLeft -= 1;
        timerText.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            // Handle the timeout case
        }
    }, 1000);

    // Logic to display number of players who answered the question
    const playersAnsweredText = document.querySelector('.answered text');
    const playersAnswered = 0;
    playersAnsweredText.textContent = playersAnswered;
});