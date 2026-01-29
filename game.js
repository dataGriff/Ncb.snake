// Game configuration
const CONFIG = {
    gridSize: 20,
    initialSpeed: 150,
    speedIncrease: 5,
    minSpeed: 50,
    canvasSize: 400
};

// NCB discount information
const NCB_DISCOUNTS = [
    { years: 0, discount: 0, message: "Start building your No Claims Bonus!" },
    { years: 1, discount: 30, message: "Great start! 1 claim-free year gives you 30% off!" },
    { years: 2, discount: 40, message: "Excellent! 2 years claim-free = 40% discount!" },
    { years: 3, discount: 50, message: "Fantastic! 3 years claim-free = 50% discount!" },
    { years: 4, discount: 60, message: "Outstanding! 4 years = 60% off your premium!" },
    { years: 5, discount: 65, message: "Amazing! 5+ years = 65% discount! You're a safe driver!" },
    { years: 9, discount: 75, message: "Incredible! 9+ years = 75% discount! Master driver!" },
    { years: 15, discount: 80, message: "Legendary! 15+ years = 80% discount! Insurance hero!" }
];

// Game state
let canvas, ctx;
let snake, direction, nextDirection, food;
let score, highScore, gameLoop, isGameRunning, speed;
let touchStartX, touchStartY;
let obstacles = [];
let lastObstacleSpawn = 0;

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    const size = Math.min(CONFIG.canvasSize, window.innerWidth - 40);
    canvas.width = size;
    canvas.height = size;
    
    // Load high score
    highScore = parseInt(localStorage.getItem('ncbHighScore')) || 0;
    document.getElementById('highScore').textContent = highScore;
    
    // Event listeners
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.addEventListener('keydown', handleKeyPress);
    
    // Mobile controls
    document.getElementById('btn-up').addEventListener('click', () => changeDirection('UP'));
    document.getElementById('btn-down').addEventListener('click', () => changeDirection('DOWN'));
    document.getElementById('btn-left').addEventListener('click', () => changeDirection('LEFT'));
    document.getElementById('btn-right').addEventListener('click', () => changeDirection('RIGHT'));
    
    // Touch controls for canvas
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Prevent scrolling on touch
    document.body.addEventListener('touchmove', (e) => {
        if (isGameRunning) {
            e.preventDefault();
        }
    }, { passive: false });
});

// Start game
function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    initializeGame();
    isGameRunning = true;
    gameLoop = setInterval(update, speed);
}

// Initialize game state
function initializeGame() {
    const gridCenter = Math.floor(CONFIG.gridSize / 2);
    snake = [
        { x: gridCenter, y: gridCenter },
        { x: gridCenter - 1, y: gridCenter },
        { x: gridCenter - 2, y: gridCenter }
    ];
    direction = 'RIGHT';
    nextDirection = 'RIGHT';
    score = 0;
    speed = CONFIG.initialSpeed;
    obstacles = [];
    lastObstacleSpawn = 0;
    updateScore();
    spawnFood();
}

// Spawn food
function spawnFood() {
    let validPosition = false;
    while (!validPosition) {
        food = {
            x: Math.floor(Math.random() * CONFIG.gridSize),
            y: Math.floor(Math.random() * CONFIG.gridSize)
        };
        validPosition = !snake.some(segment => segment.x === food.x && segment.y === food.y) &&
                       !obstacles.some(obstacle => obstacle.x === food.x && obstacle.y === food.y);
    }
}

// Spawn obstacle
function spawnObstacle() {
    const obstacleTypes = ['tree', 'car', 'signpost'];
    let validPosition = false;
    let obstacle;
    
    while (!validPosition) {
        obstacle = {
            x: Math.floor(Math.random() * CONFIG.gridSize),
            y: Math.floor(Math.random() * CONFIG.gridSize),
            type: obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
        };
        validPosition = !snake.some(segment => segment.x === obstacle.x && segment.y === obstacle.y) &&
                       !obstacles.some(obs => obs.x === obstacle.x && obs.y === obstacle.y) &&
                       !(obstacle.x === food.x && obstacle.y === food.y);
    }
    
    obstacles.push(obstacle);
}

// Game update loop
function update() {
    direction = nextDirection;
    
    // Spawn obstacles over time (every 3 score points)
    if (score > 0 && score > lastObstacleSpawn && score % 3 === 0) {
        spawnObstacle();
        lastObstacleSpawn = score;
    }
    
    // Calculate new head position
    const head = { ...snake[0] };
    switch (direction) {
        case 'UP':
            head.y--;
            break;
        case 'DOWN':
            head.y++;
            break;
        case 'LEFT':
            head.x--;
            break;
        case 'RIGHT':
            head.x++;
            break;
    }
    
    // Check collisions
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check if food eaten
    if (head.x === food.x && head.y === food.y) {
        score++;
        updateScore();
        spawnFood();
        increaseSpeed();
    } else {
        snake.pop();
    }
    
    draw();
}

// Check collision
function checkCollision(head) {
    // Wall collision
    if (head.x < 0 || head.x >= CONFIG.gridSize || head.y < 0 || head.y >= CONFIG.gridSize) {
        return true;
    }
    
    // Self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        return true;
    }
    
    // Obstacle collision
    if (obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
        return true;
    }
    
    return false;
}

// Increase speed
function increaseSpeed() {
    if (speed > CONFIG.minSpeed) {
        speed = Math.max(CONFIG.minSpeed, speed - CONFIG.speedIncrease);
        clearInterval(gameLoop);
        gameLoop = setInterval(update, speed);
    }
}

// Draw game
function draw() {
    const cellSize = canvas.width / CONFIG.gridSize;
    
    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CONFIG.gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }
    
    // Draw obstacles
    obstacles.forEach(obstacle => {
        const x = obstacle.x * cellSize;
        const y = obstacle.y * cellSize;
        
        if (obstacle.type === 'tree') {
            // Draw tree
            ctx.fillStyle = '#27ae60';
            ctx.beginPath();
            ctx.arc(x + cellSize/2, y + cellSize/2, cellSize/3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1e8449';
            ctx.beginPath();
            ctx.arc(x + cellSize/2, y + cellSize/2, cellSize/5, 0, Math.PI * 2);
            ctx.fill();
        } else if (obstacle.type === 'car') {
            // Draw parked car
            ctx.fillStyle = '#95a5a6';
            ctx.fillRect(x + 3, y + 3, cellSize - 6, cellSize - 6);
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(x + cellSize/4, y + cellSize/4, cellSize/2, cellSize/2);
        } else if (obstacle.type === 'signpost') {
            // Draw signpost
            ctx.fillStyle = '#e67e22';
            ctx.fillRect(x + cellSize/2 - 2, y + 2, 4, cellSize - 4);
            ctx.fillStyle = '#d35400';
            ctx.fillRect(x + 4, y + cellSize/4, cellSize - 8, cellSize/3);
        }
    });
    
    // Draw snake (car trail)
    snake.forEach((segment, index) => {
        const x = segment.x * cellSize;
        const y = segment.y * cellSize;
        
        if (index === 0) {
            // Draw car with more detail
            // Car body
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(x + 2, y + 4, cellSize - 4, cellSize - 8);
            
            // Car windows (windshield)
            ctx.fillStyle = '#3498db';
            if (direction === 'RIGHT') {
                ctx.fillRect(x + cellSize - 6, y + cellSize/3, 3, cellSize/3);
            } else if (direction === 'LEFT') {
                ctx.fillRect(x + 3, y + cellSize/3, 3, cellSize/3);
            } else if (direction === 'UP') {
                ctx.fillRect(x + cellSize/3, y + 3, cellSize/3, 3);
            } else if (direction === 'DOWN') {
                ctx.fillRect(x + cellSize/3, y + cellSize - 6, cellSize/3, 3);
            }
            
            // Wheels
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(x + 3, y + 4, 3, 3);
            ctx.fillRect(x + cellSize - 6, y + 4, 3, 3);
            ctx.fillRect(x + 3, y + cellSize - 7, 3, 3);
            ctx.fillRect(x + cellSize - 6, y + cellSize - 7, 3, 3);
        } else {
            // Draw trail (gradient from red to blue)
            const gradient = index / snake.length;
            const r = Math.floor(231 - gradient * (231 - 52));
            const g = Math.floor(76 - gradient * (76 - 152));
            const b = Math.floor(60 + gradient * (231 - 60));
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
        }
    });
    
    // Draw food (year token)
    const fx = food.x * cellSize;
    const fy = food.y * cellSize;
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.arc(fx + cellSize/2, fy + cellSize/2, cellSize/3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `${cellSize * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Y', fx + cellSize/2, fy + cellSize/2);
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
    
    // Calculate discount
    const discountInfo = getDiscountInfo(score);
    document.getElementById('discount').textContent = discountInfo.discount + '%';
    document.getElementById('ncb-info').innerHTML = `<p>${discountInfo.message}</p>`;
}

// Get discount info for score
function getDiscountInfo(years) {
    for (let i = NCB_DISCOUNTS.length - 1; i >= 0; i--) {
        if (years >= NCB_DISCOUNTS[i].years) {
            return NCB_DISCOUNTS[i];
        }
    }
    return NCB_DISCOUNTS[0];
}

// Game over
function gameOver() {
    isGameRunning = false;
    clearInterval(gameLoop);
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('ncbHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
    
    const discountInfo = getDiscountInfo(score);
    document.getElementById('final-score').textContent = 
        `You achieved ${score} claim-free year${score !== 1 ? 's' : ''}!`;
    document.getElementById('final-message').textContent = 
        `That earned you a ${discountInfo.discount}% discount on your insurance. ${score > 0 ? 'Great driving!' : 'Try again!'}`;
    
    document.getElementById('game-over').classList.remove('hidden');
}

// Restart game
function restartGame() {
    document.getElementById('game-over').classList.add('hidden');
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    initializeGame();
    isGameRunning = true;
    gameLoop = setInterval(update, speed);
}

// Handle keyboard input
function handleKeyPress(e) {
    if (!isGameRunning) return;
    
    const key = e.key;
    
    if ((key === 'ArrowUp' || key === 'w' || key === 'W') && direction !== 'DOWN') {
        nextDirection = 'UP';
        e.preventDefault();
    } else if ((key === 'ArrowDown' || key === 's' || key === 'S') && direction !== 'UP') {
        nextDirection = 'DOWN';
        e.preventDefault();
    } else if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && direction !== 'RIGHT') {
        nextDirection = 'LEFT';
        e.preventDefault();
    } else if ((key === 'ArrowRight' || key === 'd' || key === 'D') && direction !== 'LEFT') {
        nextDirection = 'RIGHT';
        e.preventDefault();
    }
}

// Change direction from buttons
function changeDirection(newDirection) {
    if (!isGameRunning) return;
    
    if (newDirection === 'UP' && direction !== 'DOWN') {
        nextDirection = 'UP';
    } else if (newDirection === 'DOWN' && direction !== 'UP') {
        nextDirection = 'DOWN';
    } else if (newDirection === 'LEFT' && direction !== 'RIGHT') {
        nextDirection = 'LEFT';
    } else if (newDirection === 'RIGHT' && direction !== 'LEFT') {
        nextDirection = 'RIGHT';
    }
}

// Handle touch start
function handleTouchStart(e) {
    if (!isGameRunning) return;
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

// Handle touch move (swipe)
function handleTouchMove(e) {
    if (!isGameRunning || !touchStartX || !touchStartY) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 30 && direction !== 'LEFT') {
            nextDirection = 'RIGHT';
            touchStartX = null;
            touchStartY = null;
        } else if (deltaX < -30 && direction !== 'RIGHT') {
            nextDirection = 'LEFT';
            touchStartX = null;
            touchStartY = null;
        }
    } else {
        // Vertical swipe
        if (deltaY > 30 && direction !== 'UP') {
            nextDirection = 'DOWN';
            touchStartX = null;
            touchStartY = null;
        } else if (deltaY < -30 && direction !== 'DOWN') {
            nextDirection = 'UP';
            touchStartX = null;
            touchStartY = null;
        }
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    if (!isGameRunning && snake) {
        const size = Math.min(CONFIG.canvasSize, window.innerWidth - 40);
        canvas.width = size;
        canvas.height = size;
        draw();
    }
});
