let chamber = [];
let currentPlayer;
let gameOver = false;
let usedShootOpponent = { 1: false, 2: false };

let scoreHistory = [];


let scoreList = document.querySelector(".score-list")
let emptyScore = document.querySelector(".empty-score")
let welcomeContainer = document.querySelector(".welcome-container")
let gameContainer = document.querySelector(".game-container")

//Taking music and video to play 
const music = document.querySelector(".background-music");
music.volume = 0.1;
const video = document.querySelector(".background-video");

//Revolver shot sounds 
let fakeShot = document.querySelector(".fake-shot")
let realShot = document.querySelector(".real-shot")

function playFakeShot() {
    fakeShot.currentTime = 0;
    fakeShot.play();
}

function playRealShot() {
    realShot.currentTime = 0;
    realShot.play();
}

//Taking video and audio to play it once user click once on the page 
document.addEventListener("click", () => {
    if (music) {
        music.muted = false;
        music.play();
    }
    if (video) {
        video.muted = false;
        video.play();
    }
}, { once: true });

//Function to play music only on welcome screen
function updateMusic() {
    // check actual visibility for further fadeIn / Out jQuery 
    if ($(welcomeContainer).is(":visible")) {
        music.play();
    } else {
        music.pause();
        music.currentTime = 0;
    }
}

//chamber of 6 with 1 random bullet inside
function loadRevolver() {
    chamber = [0, 0, 0, 0, 0, 0];
    const randomBullet = Math.floor(Math.random() * 6);
    chamber[randomBullet] = 1;
}

$(".start-button").on("click", startGame)
$(".quit-button").on("click", function () {
    location.reload();
})

function startGame() {
    // ===PREPARE THE GAME===
    //prepare all stuff for the game: no game over, random 1 or 2 player, load Revolver
    gameOver = false;
    currentPlayer = Math.floor(Math.random() * 2) + 1;
    loadRevolver();
    usedShootOpponent = { 1: false, 2: false };

    $(welcomeContainer).fadeOut(500, () => {
        $(gameContainer).fadeIn(500);
        updateMusic();
    });

    // ===ACTUAL GAME===
    //game message in the beginning of the game
    let messageArea = document.createElement("div")
    messageArea.textContent = `Player ${currentPlayer}'s turn — choose to shoot yourself or the opponent`
    messageArea.classList.add("message-area")
    gameContainer.appendChild(messageArea)

    //create shoot self button
    let shootSelf = document.createElement("button")
    shootSelf.textContent = "Pull the Trigger"
    shootSelf.classList.add("shoot-self")

    //create shoot opponent button
    let shootOpponent = document.createElement("button")
    shootOpponent.classList.add("shoot-opponent")
    shootOpponent.textContent = "Fire at Opponent"

    //create group for self/opponent buttons
    let buttonGroup = document.createElement("div")
    buttonGroup.classList.add("button-group")

    //connect them to the game container
    buttonGroup.appendChild(shootSelf)
    buttonGroup.appendChild(shootOpponent)
    gameContainer.appendChild(buttonGroup)

    //add functions to buttons by Event listeners
    $(document).off("click", ".shoot-self").on("click", ".shoot-self", shootSelfFunction);
    $(document).off("click", ".shoot-opponent").on("click", ".shoot-opponent", shootOpponentFunction);

    //function for disable the Shoot Opponent Button if used
    function updateButtons() {
        //still keep shoot self active
        $(".shoot-self").prop("disabled", false);

        //disable shoot opponent button for the player which used this function
        if (usedShootOpponent[currentPlayer]) {
            $(".shoot-opponent").prop("disabled", true).addClass("disabled");
        } else {
            $(".shoot-opponent").prop("disabled", false).removeClass("disabled");
        }
    }

    //function for the Self Shoot
    function shootSelfFunction() {
        //stop game
        if (gameOver) return;

        //take the first chamber
        let shot = chamber.shift();

        if (shot === 1) {
            playRealShot();
            gameOver = true;

            $(".message-area").text(`Player ${currentPlayer} pulled the trigger on themselves and... DIED!`);
            $(".shoot-self, .shoot-opponent").prop("disabled", true);

            //if player shoots self and dies, the other player wins
            let winner = currentPlayer === 1 ? 2 : 1;
            endGame(winner);
        } else {
            playFakeShot();
            $(".message-area").text(`Player ${currentPlayer} pulled the trigger on themselves and survived!`);

            //switch turn to the other player
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            $(".message-area").append(` Now it's Player ${currentPlayer}'s turn.`);
            updateButtons();
        }
    }

    //function for the Opponent Shoot
    function shootOpponentFunction() {
        //stop game
        if (gameOver) return;

        //mark this player as having used the opponent shot
        usedShootOpponent[currentPlayer] = true;

        let targetPlayer = currentPlayer === 1 ? 2 : 1; // the player being targeted
        let shot = chamber.shift();

        if (shot === 1) {
            playRealShot()
            gameOver = true;

            $(".message-area").text(`Player ${currentPlayer} fired at Player ${targetPlayer} and HIT! Player ${targetPlayer} dies.`);
            $(".shoot-self, .shoot-opponent").prop("disabled", true);

            //shooter wins if hit
            let winner = currentPlayer;
            endGame(winner);
        } else {
            playFakeShot()
            $(".message-area").text(`Player ${currentPlayer} fired at Player ${targetPlayer}, but Player ${targetPlayer} survived!`);

            //switch turn to the other player
            currentPlayer = targetPlayer;
            $(".message-area").append(` Now it's Player ${currentPlayer}'s turn.`);
            updateButtons();
        }
    }

    function endGame(winner) {
        //create variable for the only last death message
        let finalMessage = messageArea.textContent

        scoreHistory.push({
            game: scoreHistory.length + 1,
            winner: winner
        })

        updateScoreboard();

        //clean game container
        gameContainer.innerHTML = "";

        //create space to show this final message 
        let messageAreaFinal = document.createElement("div")
        messageAreaFinal.textContent = finalMessage
        messageAreaFinal.classList.add("final-message-area")
        gameContainer.appendChild(messageAreaFinal)

        //create a button for replay 
        let replayButton = document.createElement("button")
        replayButton.textContent = "Replay Game"
        replayButton.classList.add("replay-button")
        gameContainer.appendChild(replayButton)

        //replay leads to welcome screen - NOT DIRECTLY TO THE GAME
        //by off - removing any existing replay button and by on - adding new 
        $(document).off("click", ".replay-button").on("click", ".replay-button", function () {
            $(gameContainer).fadeOut(500, () => {
                $(welcomeContainer).fadeIn(500);
                $(gameContainer).empty();
                updateMusic();
            });
        });
    }
}

function updateScoreboard() {
    if (scoreHistory.length === 0) {
        emptyScore.classList.add("active")
        emptyScore.classList.remove("hidden")
        scoreList.classList.add("hidden")
        scoreList.classList.remove("active")
        return;
    } else {
        emptyScore.classList.add("hidden")
        emptyScore.classList.remove("active")
        scoreList.classList.add("active")
        scoreList.classList.remove("hidden")
        scoreList.innerHTML = "";

        scoreHistory.forEach(entry => {
            const li = document.createElement("li")
            li.textContent = `Game ${entry.game}: Player ${entry.winner} wins`
            scoreList.appendChild(li)
        })
    }
}
