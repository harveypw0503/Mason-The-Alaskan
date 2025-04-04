const marker = document.getElementById("marker");
const bar = document.getElementById("bar");
const result = document.getElementById("result");
const actionButton = document.getElementById("action-button");
const pauseButton = document.getElementById("pause-button");
const pauseOverlay = document.getElementById("pause-overlay");
const outcomeImage = document.getElementById("outcome-image");
const stageScoreDisplay = document.getElementById("stage-score");
const totalScoreDisplay = document.getElementById("total-score");

let markerPosition = 0, speed = 1.5, direction = 1, isPlaying = false, isPaused = false, score = 0;
const maxScore = 69000;
const images = { neutral: "./Assets/neutral.png", win: "./Assets/win.png", lose: "./Assets/lose.png" };
let totalScore = parseInt(localStorage.getItem('totalScore')) || 0;
totalScoreDisplay.textContent = totalScore;

function getMarkerZone() {
    if (markerPosition < 25 || markerPosition > 75) return "red";
    if ((markerPosition >= 25 && markerPosition < 37.5) || (markerPosition > 62.5 && markerPosition <= 75)) return "yellow";
    return "green";
}

function updateMarkerPosition() {
    if (!isPlaying || isPaused) return;
    markerPosition += speed * direction;
    if (markerPosition >= 100 || markerPosition <= 0) direction *= -1;
    const barWidth = bar.offsetWidth;
    marker.style.transform = `translateX(${(markerPosition / 100) * barWidth}px)`;
    requestAnimationFrame(updateMarkerPosition);
}

actionButton.onclick = () => {
    if (!isPlaying || isPaused) return;
    const zone = getMarkerZone();
    if (zone === "green") {
        score += 2300;
        if (score > maxScore) score = maxScore;
        result.textContent = `You win! Mason defeats the bear! (+2300 points)`;
        outcomeImage.src = images.win;
        speed += 0.5;
        stageScoreDisplay.textContent = score;
        if (score >= maxScore) {
            isPlaying = false;
            moveToNextStage();
        } else {
            resetRound();
        }
    } else if (zone === "yellow") {
        result.textContent = "Close! Try again!";
        outcomeImage.src = images.neutral;
    } else {
        result.textContent = "You lose! The bear wins!";
        outcomeImage.src = images.lose;
        isPlaying = false;
        moveToNextStage();
    }
};

function togglePause() {
    if (!isPlaying) return;
    isPaused = !isPaused;
    pauseOverlay.style.display = isPaused ? "flex" : "none";
    pauseButton.textContent = isPaused ? "Resume" : "Pause";
    if (!isPaused) requestAnimationFrame(updateMarkerPosition);
}

pauseButton.onclick = togglePause;
window.addEventListener("keydown", e => { if (e.key === " " && isPlaying) togglePause(); });

function startGame() {
    isPlaying = true;
    isPaused = false;
    pauseOverlay.style.display = "none";
    pauseButton.textContent = "Pause";
    result.textContent = "Press Lock In when the marker is in the green zone!";
    outcomeImage.src = images.neutral;
    markerPosition = Math.random() * 100;
    direction = Math.random() < 0.5 ? 1 : -1;
    requestAnimationFrame(updateMarkerPosition);
}

function resetRound() {
    markerPosition = Math.random() * 100;
    direction = Math.random() < 0.5 ? 1 : -1;
}

function moveToNextStage() {
    totalScore += score;
    localStorage.setItem('totalScore', totalScore);
    window.location.href = 'snowmachine.html';
}

startGame();