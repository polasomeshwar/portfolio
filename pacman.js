const canvasGame = document.getElementById('pacman-game');
const ctxGame = canvasGame.getContext('2d');
const startScreen = document.getElementById('start-screen');
const scoreDisplay = document.getElementById('score-display');

const CELL_SIZE = 20;
const ROWS = 10;
const COLS = 20;

// 1: wall, 0: dot, 2: empty
const initialMap = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

let mapGame = [];
let pacman = { x: 1, y: 1, vx: 0, vy: 0, nextVx: 0, nextVy: 0, xOffset: 0, yOffset: 0, speed: 2 };
let gameScore = 0;
let totalDots = 0;
let isPlaying = false;
let mouthOpen = 0;
let mouthDir = 1;

function resetGame() {
    mapGame = initialMap.map(row => [...row]);
    totalDots = mapGame.flat().filter(cell => cell === 0).length;
    gameScore = 0;
    pacman = { x: 1, y: 1, vx: 0, vy: 0, nextVx: 0, nextVy: 0, xOffset: 0, yOffset: 0, speed: 2 };
    scoreDisplay.innerText = `Score: ${gameScore}/${totalDots}`;
    startScreen.style.display = 'none';
    isPlaying = true;
    requestAnimationFrame(updateGame);
}

startScreen.addEventListener('click', () => {
    if (!isPlaying) resetGame();
});

window.addEventListener('keydown', (e) => {
    if (!isPlaying) return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
    }
    if (e.key === 'ArrowUp') { pacman.nextVx = 0; pacman.nextVy = -1; }
    if (e.key === 'ArrowDown') { pacman.nextVx = 0; pacman.nextVy = 1; }
    if (e.key === 'ArrowLeft') { pacman.nextVx = -1; pacman.nextVy = 0; }
    if (e.key === 'ArrowRight') { pacman.nextVx = 1; pacman.nextVy = 0; }
});

function drawGame() {
    // Colors based on theme
    const isLight = document.body.classList.contains('light-mode');
    const bg = isLight ? '#fff' : '#000';
    const fg = isLight ? '#000' : '#fff';

    ctxGame.fillStyle = bg;
    ctxGame.fillRect(0, 0, canvasGame.width, canvasGame.height);

    // Draw map
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (mapGame[r][c] === 1) {
                ctxGame.fillStyle = isLight ? '#eee' : '#111';
                ctxGame.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                ctxGame.strokeStyle = fg;
                ctxGame.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            } else if (mapGame[r][c] === 0) {
                ctxGame.fillStyle = fg;
                ctxGame.beginPath();
                ctxGame.arc(c * CELL_SIZE + CELL_SIZE / 2, r * CELL_SIZE + CELL_SIZE / 2, 2, 0, Math.PI * 2);
                ctxGame.fill();
            }
        }
    }

    // Draw pacman
    const px = pacman.x * CELL_SIZE + pacman.xOffset + CELL_SIZE / 2;
    const py = pacman.y * CELL_SIZE + pacman.yOffset + CELL_SIZE / 2;

    let angle = 0;
    if (pacman.vx === 1) angle = 0;
    if (pacman.vx === -1) angle = Math.PI;
    if (pacman.vy === 1) angle = Math.PI / 2;
    if (pacman.vy === -1) angle = -Math.PI / 2;

    mouthOpen += 0.05 * mouthDir;
    if (mouthOpen >= 0.25 || mouthOpen <= 0) mouthDir *= -1;

    ctxGame.fillStyle = fg;
    ctxGame.beginPath();
    ctxGame.arc(px, py, CELL_SIZE / 2 - 2, angle + mouthOpen * Math.PI, angle + (2 - mouthOpen) * Math.PI);
    ctxGame.lineTo(px, py);
    ctxGame.fill();
}

function updateGame() {
    if (!isPlaying) return;

    if (pacman.xOffset === 0 && pacman.yOffset === 0) {
        // Can we turn?
        if (pacman.nextVx !== 0 || pacman.nextVy !== 0) {
            if (mapGame[pacman.y + pacman.nextVy][pacman.x + pacman.nextVx] !== 1) {
                pacman.vx = pacman.nextVx;
                pacman.vy = pacman.nextVy;
            }
        }

        // Can we move forward?
        if (mapGame[pacman.y + pacman.vy][pacman.x + pacman.vx] === 1) {
            pacman.vx = 0;
            pacman.vy = 0;
        }
    }

    pacman.xOffset += pacman.vx * pacman.speed;
    pacman.yOffset += pacman.vy * pacman.speed;

    if (Math.abs(pacman.xOffset) >= CELL_SIZE) {
        pacman.x += Math.sign(pacman.xOffset);
        pacman.xOffset = 0;
    }
    if (Math.abs(pacman.yOffset) >= CELL_SIZE) {
        pacman.y += Math.sign(pacman.yOffset);
        pacman.yOffset = 0;
    }

    // Eat dot
    if (pacman.xOffset === 0 && pacman.yOffset === 0 && mapGame[pacman.y][pacman.x] === 0) {
        mapGame[pacman.y][pacman.x] = 2;
        gameScore++;
        scoreDisplay.innerText = `Score: ${gameScore}/${totalDots}`;
        if (gameScore >= totalDots) {
            isPlaying = false;
            startScreen.innerText = "You Win! Click to play again.";
            startScreen.style.display = 'flex';
        }
    }

    drawGame();
    if (isPlaying) requestAnimationFrame(updateGame);
}

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

canvasGame.addEventListener('touchstart', (e) => {
    if (!isPlaying) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

canvasGame.addEventListener('touchend', (e) => {
    if (!isPlaying) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) { pacman.nextVx = 1; pacman.nextVy = 0; }
        else { pacman.nextVx = -1; pacman.nextVy = 0; }
    } else {
        if (dy > 0) { pacman.nextVx = 0; pacman.nextVy = 1; }
        else { pacman.nextVx = 0; pacman.nextVy = -1; }
    }
}, { passive: true });

drawGame(); // initial draw
