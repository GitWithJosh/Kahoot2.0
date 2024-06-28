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

    const buttons = document.querySelectorAll('.answer-container .button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove all buttons from the answer container
            const answerContainer = document.querySelector('.answer-container');
            answerContainer.innerHTML = '';

            // Add the clicked button back, with 90% width
            button.style.flex = '1 1 100%';
            button.style.margin = '10px 10%';
            answerContainer.appendChild(button);
        });
    });
});
