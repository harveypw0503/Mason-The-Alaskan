document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const pauseOverlay = document.getElementById("pause-overlay");
    const pauseButton = document.getElementById("pause-button");
    const stageScoreDisplay = document.getElementById("stage-score");
    const totalScoreDisplay = document.getElementById("total-score");
    const touchFeedback = document.getElementById("touch-feedback");

    if (!canvas || !ctx || !pauseOverlay || !pauseButton || !stageScoreDisplay || !totalScoreDisplay || !touchFeedback) {
        console.error("One or more DOM elements not found. Check HTML IDs.");
        return;
    }

    canvas.width = document.getElementById("game-container").offsetWidth;
    canvas.height = canvas.width * 0.75;

    const images = {
        player: new Image(), enemy: new Image(), harderEnemy: new Image()
    };
    images.player.src = "Purple spaceship.png";
    images.enemy.src = "enemy.png";
    images.harderEnemy.src = "darker enemy.png";

    const player = { x: canvas.width / 2, y: canvas.height - 100, width: 50, height: 70, speed: 8, cooldown: 0 };
    const lasers = [], enemies = [];
    let score = 0, timeElapsed = 0, gameRunning = true, shipPassed = 0, gamePaused = false, lastEnemySpawnTime = 0, enemySpawnedThisSecond = 0;
    const maxScore = 69000;
    let keys = {}, lastTime = 0;
    let totalScore = parseInt(localStorage.getItem('totalScore')) || 0;
    totalScoreDisplay.textContent = totalScore;

    function spawnEnemy() {
        let x, attempts = 0;
        do {
            x = Math.random() * (canvas.width - 50);
            attempts++;
        } while (enemies.some(enemy => Math.abs(enemy.x - x) < 60) && attempts < 10);
        const type = timeElapsed > 75 ? (Math.random() > 0.5 ? "easy" : "hard") : "easy";
        enemies.push({ x, y: -50, width: 50, height: 50, speed: type === "easy" ? 2 : 2 * 1.15, img: type === "easy" ? images.enemy : images.harderEnemy });
    }
    function shootLaser() {
        if (player.cooldown <= 0) {
            lasers.push({ x: player.x + player.width / 2 - 5, y: player.y, width: 10, height: 20, dy: -10 });
            player.cooldown = 0.25;
        }
    }
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(images.player, player.x, player.y, player.width, player.height);
        lasers.forEach(laser => {
            ctx.fillStyle = "lime";
            ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
        });
        enemies.forEach(enemy => {
            let scale = 1.3 - Math.min(timeElapsed / 200, 0.4);
            ctx.save();
            ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            ctx.rotate(Math.PI);
            ctx.scale(scale, scale);
            ctx.drawImage(enemy.img, -enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
            ctx.restore();
        });
        ctx.fillStyle = "white";
        ctx.font = "1rem Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Stage Score: ${Math.floor(score)}`, 10, 30);
        const shipsPassedText = `Ships Passed: ${shipPassed}/3`;
        ctx.textAlign = "right";
        ctx.fillText(shipsPassedText, canvas.width - 10, 30);
        pauseOverlay.style.display = gamePaused ? "flex" : "none";
        pauseButton.textContent = gamePaused ? "Resume" : "Pause";
    }
    function update(deltaTime) {
        if (gamePaused || !gameRunning) return;
        if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
        if (keys["ArrowRight"] && player.x < canvas.width - player.width) player.x += player.speed;
        if (player.cooldown > 0) player.cooldown -= deltaTime;
        for (let i = lasers.length - 1; i >= 0; i--) {
            lasers[i].y += lasers[i].dy;
            if (lasers[i].y < 0) lasers.splice(i, 1);
        }
        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].y += enemies[i].speed;
            if (enemies[i].y > canvas.height) {
                enemies.splice(i, 1);
                shipPassed++;
                if (shipPassed >= 3) {
                    gameRunning = false;
                    moveToNextStage();
                }
            }
            for (let j = lasers.length - 1; j >= 0; j--) {
                if (checkCollision(lasers[j], enemies[i])) {
                    enemies.splice(i, 1);
                    lasers.splice(j, 1);
                    score += 50;
                    break;
                }
            }
        }
        let spawnRate = timeElapsed <= 30 ? 1 : timeElapsed <= 60 ? 2 : timeElapsed <= 90 ? 3 : 4;
        if (enemySpawnedThisSecond < spawnRate) {
            spawnEnemy();
            enemySpawnedThisSecond++;
        }
        if (timeElapsed - lastEnemySpawnTime >= 1) {
            lastEnemySpawnTime = timeElapsed;
            enemySpawnedThisSecond = 0;
        }
        score += 100 * deltaTime;
        if (score > maxScore) score = maxScore;
        stageScoreDisplay.textContent = Math.floor(score);
        timeElapsed += deltaTime;
        if (score >= maxScore) moveToNextStage();
    }
    function checkCollision(a, b) {
        return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    }
    function togglePause(e) {
        if (e) e.preventDefault();
        if (!gameRunning) return;
        gamePaused = !gamePaused;
        if (!gamePaused) requestAnimationFrame(gameLoop);
    }
    function showTouchFeedback(x, y) {
        touchFeedback.style.left = `${x - 25}px`;
        touchFeedback.style.top = `${y - 25}px`;
        touchFeedback.style.display = "block";
        setTimeout(() => touchFeedback.style.display = "none", 200);
    }
    function gameLoop(timestamp) {
        if (!gameRunning) return;
        const deltaTime = (timestamp - lastTime) / 1000;
        lastTime = timestamp;
        update(deltaTime);
        render();
        if (!gamePaused) requestAnimationFrame(gameLoop);
    }
    function moveToNextStage() {
        totalScore += score;
        localStorage.setItem('totalScore', totalScore);
        alert(`Game Over! Final Score: ${totalScore}`);
        window.location.href = 'index.html';
    }

    window.addEventListener("keydown", e => {
        if (e.key === " ") shootLaser();
        else keys[e.key] = true;
    });
    window.addEventListener("keyup", e => keys[e.key] = false);

    let touchStartX = 0;
    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        touchStartX = e.touches[0].clientX;
        showTouchFeedback(e.touches[0].clientX, e.touches[0].clientY);
        const rect = canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        if (touchY < canvas.height / 2) shootLaser();
    });
    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const touchX = e.touches[0].clientX;
        const deltaX = touchX - touchStartX;
        player.x += deltaX * (player.speed / 50);
        if (player.x < 0) player.x = 0;
        if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
        touchStartX = touchX;
    });

    pauseButton.addEventListener("click", togglePause);
    pauseButton.addEventListener("touchstart", togglePause);

    images.player.onload = () => {
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    };
    if (images.player.complete) {
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
});