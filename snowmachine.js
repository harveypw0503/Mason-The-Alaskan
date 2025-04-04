const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const pauseOverlay = document.getElementById("pause-overlay");
const pauseButton = document.getElementById("pause-button");
const stageScoreDisplay = document.getElementById("stage-score");
const totalScoreDisplay = document.getElementById("total-score");

const images = {};
const assets = {
    backgroundImg: "Empty hill.png", playerImg: "Mason on snow machine.png",
    playerLeftImg: "leftwards.png", playerRightImg: "rightwards.png",
    treeImg: "Tree 1.png", stumpImg: "Stump 1.png",
    crashObstacleImg: "crash.png", crashMasonImg: "Crash Mason.png"
};
for (let key in assets) { images[key] = new Image(); images[key].src = assets[key]; }

let player = { x: canvas.width / 2 - 25, y: canvas.height - 100, width: 50, height: 80, lane: 1, speed: 10, image: images.playerImg };
let obstacles = [], gameSpeed = 2, spawnTimer = 0, score = 0, crashAnimation = null, isPaused = false, lastTime = 0;
const maxScore = 69000;
const horizonY = canvas.height * 0.2;
let totalScore = parseInt(localStorage.getItem('totalScore')) || 0;
totalScoreDisplay.textContent = totalScore;

function drawPlayer() { ctx.drawImage(player.image, player.x, player.y, player.width, player.height); }
function generateObstacle() {
    const obstacleTypes = [{ image: images.treeImg, aspectRatio: 1.5, sizeMultiplier: 1.35 }, { image: images.stumpImg, aspectRatio: 0.7, sizeMultiplier: 1.1 }];
    const lane = Math.floor(Math.random() * 3);
    const selected = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    obstacles.push({
        x: lane * (canvas.width / 3) + canvas.width / 6 - 25, y: horizonY, baseSize: 30,
        maxWidth: 70 * selected.sizeMultiplier, maxHeight: 70 * selected.sizeMultiplier * selected.aspectRatio,
        width: 30, height: 30 * selected.aspectRatio, image: selected.image, aspectRatio: selected.aspectRatio, sizeMultiplier: selected.sizeMultiplier
    });
}
function drawObstacles() {
    obstacles.forEach(obstacle => {
        const fullSizeY = horizonY + (canvas.height - horizonY) * 0.25;
        let scale = obstacle.y < fullSizeY ? (obstacle.y - horizonY) / (fullSizeY - horizonY) : 1;
        obstacle.width = obstacle.baseSize + scale * (obstacle.maxWidth - obstacle.baseSize);
        obstacle.height = obstacle.width * obstacle.aspectRatio;
        gameSpeed = 2 + (score / maxScore) * 3;
        ctx.drawImage(obstacle.image, obstacle.x - obstacle.width / 2, obstacle.y, obstacle.width, obstacle.height);
        obstacle.y += gameSpeed;
    });
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);
}
function checkCollision() {
    obstacles.forEach(obstacle => {
        if (player.x < obstacle.x + obstacle.width && player.x + player.width > obstacle.x && player.y < obstacle.y + obstacle.height && player.y + player.height > obstacle.y) {
            crashAnimation = { mason: { x: player.x, y: player.y - 20, width: player.width, height: player.height }, obstacle: { x: obstacle.x, y: obstacle.y, width: obstacle.width, height: obstacle.height } };
            setTimeout(moveToNextStage, 500);
        }
    });
}
function drawCrashAnimation() {
    if (crashAnimation) {
        ctx.drawImage(images.crashMasonImg, crashAnimation.mason.x, crashAnimation.mason.y, crashAnimation.mason.width, crashAnimation.mason.height);
        ctx.drawImage(images.crashObstacleImg, crashAnimation.obstacle.x, crashAnimation.obstacle.y, crashAnimation.obstacle.width, crashAnimation.obstacle.height);
    }
}
function drawScore() { ctx.fillStyle = "black"; ctx.font = "20px Arial"; ctx.textAlign = "left"; ctx.fillText(`Stage Score: ${Math.floor(score)}`, 10, 30); }
function drawPauseOverlay() { pauseOverlay.style.display = isPaused ? "flex" : "none"; }
function togglePause() { 
    isPaused = !isPaused; 
    pauseOverlay.style.display = isPaused ? "flex" : "none"; 
    pauseButton.textContent = isPaused ? "Resume" : "Pause"; 
    if (!isPaused) requestAnimationFrame(gameLoop); 
}

window.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" || e.key === "a") { if (player.lane > 0) { player.lane--; player.image = images.playerLeftImg; player.x -= canvas.width / 3; } }
    else if (e.key === "ArrowRight" || e.key === "d") { if (player.lane < 2) { player.lane++; player.image = images.playerRightImg; player.x += canvas.width / 3; } }
});
window.addEventListener("keyup", () => player.image = images.playerImg);
pauseButton.addEventListener("click", togglePause);
window.addEventListener("blur", () => { if (!isPaused) togglePause(); });

function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.backgroundImg, 0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawObstacles();
    checkCollision();
    drawCrashAnimation();
    drawScore();
    drawPauseOverlay();
    if (isPaused) return;
    score += 100 * deltaTime;
    if (score > maxScore) score = maxScore;
    stageScoreDisplay.textContent = Math.floor(score);
    spawnTimer += deltaTime;
    const spawnInterval = 2 - (score / maxScore) * 1.5;
    if (spawnTimer >= spawnInterval) { generateObstacle(); spawnTimer = 0; }
    if (score >= maxScore) moveToNextStage();
    requestAnimationFrame(gameLoop);
}

function moveToNextStage() {
    totalScore += score;
    localStorage.setItem('totalScore', totalScore);
    window.location.href = 'defendmars.html';
}

images.backgroundImg.onload = () => { generateObstacle(); requestAnimationFrame(gameLoop); };