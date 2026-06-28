let word = "";
let guessedWord = [];
let attempts = 10;

const wordDisplay = document.getElementById("word-display");
const messageDisplay = document.getElementById("message");
const attemptsDisplay = document.getElementById("attempts-display");
const guessInput = document.getElementById("guess-input");

fetch('words.txt')
    .then(response => response.text())
    .then(text => {
        const words = text.split('\n').map(w => w.trim().toLowerCase()).filter(w => w.length > 0);

        word = words[Math.floor(Math.random() * words.length)];

        guessedWord = Array(word.length).fill("_");

        messageDisplay.innerText = "Spiel bereit!";
        updateDisplay();
    })
    .catch(error => {
        messageDisplay.innerText = "Fehler beim Laden der Wörter.";
    });

function updateDisplay() {
    wordDisplay.innerText = guessedWord.join(" ");
    attemptsDisplay.innerText = `Versuche übrig: ${attempts}`;
}

function makeGuess() {
    if (attempts <= 0 || !guessedWord.includes("_")) return;

    const guess = guessInput.value.toLowerCase();
    guessInput.value = "";
    guessInput.focus();

    if (guess.length !== 1 || !/^[a-zäöüß]$/i.test(guess)) {
        messageDisplay.innerText = "Bitte gib einen einzelnen Buchstaben ein.";
        return;
    }

    if (guessedWord.includes(guess)) {
        messageDisplay.innerText = "Den Buchstaben hast du schon aufgedeckt!";
        return;
    }

    if (word.includes(guess)) {
        messageDisplay.innerText = "Richtig!";
        for (let i = 0; i < word.length; i++) {
            if (word[i] === guess) {
                guessedWord[i] = guess;
            }
        }
    } else {
        attempts--;
        messageDisplay.innerText = "Falsch!";
    }

    updateDisplay();

    if (!guessedWord.includes("_")) {
        messageDisplay.innerText = "Gewonnen! Das Wort war: " + word;
    } else if (attempts === 0) {
        messageDisplay.innerText = "Verloren! Das Wort war: " + word;
    }
}

guessInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        makeGuess();
    }
});
