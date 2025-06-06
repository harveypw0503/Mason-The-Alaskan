document.addEventListener("DOMContentLoaded", () => {
    const marker = document.getElementById("marker");
    const bar = document.getElementById("bar");
    const result = document.getElementById("result");
    const actionButton = document.getElementById("action-button");
    const pauseButton = document.getElementById("pause-button");
    const pauseOverlay = document.getElementById("pause-overlay");
    const outcomeImage = document.getElementById("outcome-image");
    const stageScoreDisplay = document.getElementById("stage-score");
    const totalScoreDisplay = document.getElementById("total-score");
    const touchFeedback = document.getElementById("touch-feedback");

    if (!marker || !bar || !result || !actionButton || !pauseButton || !pauseOverlay || !outcomeImage || !stageScoreDisplay || !totalScoreDisplay || !touchFeedback) {
        console.error("One or more DOM elements not found. Check HTML IDs.");
        return;
    }

    let markerPosition = 0, speed = 1.5, direction = 1, isPlaying = false, isPaused = false, score = 0;
    const maxScore = 69000;
    const images = { neutral: "neutral.png", win: "win.png", lose: "lose.png" };
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
        if (barWidth === 0) {
            console.warn("Bar width is 0. Check CSS or DOM readiness.");
            return;
        }
        marker.style.transform = `translateX(${(markerPosition / 100) * barWidth}px)`;
        requestAnimationFrame(updateMarkerPosition);
    }

    function handleAction(e) {
        if (!isPlaying || isPaused) return;
        if (e) e.preventDefault(); // Prevent scrolling on touch
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
        // Show touch feedback
        if (e && e.touches) {
            const touch = e.touches[0];
            touchFeedback.style.left = `${touch.clientX - 25}px`;
            touchFeedback.style.top = `${touch.clientY - 25}px`;
            touchFeedback.style.display = "block";
            setTimeout(() => touchFeedback.style.display = "none", 200);
        }
    }

    function togglePause(e) {
        if (!isPlaying) return;
        if (e) e.preventDefault();
        isPaused = !isPaused;
        pauseOverlay.style.display = isPaused ? "flex" : "none";
        pauseButton.textContent = isPaused ? "Resume" : "Pause";
        if (!isPaused) requestAnimationFrame(updateMarkerPosition);
    }

    // Event listeners
    actionButton.addEventListener("click", handleAction);
    actionButton.addEventListener("touchstart", handleAction);
    pauseButton.addEventListener("click", togglePause);
    pauseButton.addEventListener("touchstart", togglePause);
    window.addEventListener("keydown", (e) => {
        if (e.key === " " && isPlaying) togglePause();
    });
    // Direct screen tap for "Lock In"
    document.getElementById("game-container").addEventListener("touchstart", (e) => {
        if (e.target !== actionButton && e.target !== pauseButton) handleAction(e);
    });

    function startGame() {
        isPlaying = true;
        isPaused = false;
        pauseOverlay.style.display = "none";
        pauseButton.textContent = "Pause";
        result.textContent = "Tap screen when the marker is in the green zone!";
        outcomeImage.src = images.neutral;
        markerPosition = Math.random() * 100;
        direction = Math.random() < 0.5 ? 1 : -1;
        console.log("Game started, marker should move.");
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
});