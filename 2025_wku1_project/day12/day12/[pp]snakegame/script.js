const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");
const speedMsg = document.getElementById("speedMsg"); 
const mineMsg = document.getElementById("mineMsg");

// 게임 설정
const tileCount = 20; 
const tileSize = canvas.width / tileCount; 

// 변수 선언
let headX = 10;
let headY = 10;
let velocityX = 0;
let velocityY = 0;
let snakeParts = [];
let tailLength = 2;
let appleX = 5;
let appleY = 5;
let score = 0;
let speed = 7;
let isGameOverFlag = false;

// 기존에 너무 빠르게 키 전환을 했을 때 죽는 버그를 인지
// 한 번 누르면 한 칸 이동할 때까지 입력 방지를 통해 예외 처리 강화
let canChangeDirection = true; 

// 장애물
let obstacles = []; 
let obstacleTimer = null; 

// 뱀 몸통
class SnakePart {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// --- 게임 루프 ---
function drawGame() {
    if (isGameOverFlag) return;

    changeSnakePosition();
    
    // 위치 이동이 끝났기 때문에 다른 키를 입력 가능하게 만듦
    canChangeDirection = true; 
    
    if (isGameOver()) {
        return;
    }

    clearScreen();
    drawCheckeredBackground();
    
    drawObstacles(); 
    
    checkAppleCollision();
    drawApple();
    drawSnake(); 

    setTimeout(drawGame, 1000 / speed);
}

// 죽었을 때 함수 정의
function isGameOver() {
    let gameOver = false;

    if (velocityX === 0 && velocityY === 0) return false;

    if (headX < 0 || headX >= tileCount || headY < 0 || headY >= tileCount) {
        gameOver = true;
    }

    for (let part of snakeParts) {
        if (part.x === headX && part.y === headY) {
            gameOver = true;
        }
    }

    for (let obs of obstacles) {
        if (obs.x === headX && obs.y === headY) {
            gameOver = true;
        }
    }

    if (gameOver) {
        isGameOverFlag = true; 
        clearInterval(obstacleTimer); 

        ctx.fillStyle = "white";
        ctx.font = "bold 50px Arial";
        ctx.textAlign = "center";
        ctx.shadowBlur = 0; 
        
        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
        
        ctx.font = "15px Arial";
        ctx.fillText("Press Enter to Restart", canvas.width / 2, canvas.height / 2 + 30);

        restartBtn.style.display = "block";
    }
    return gameOver;
}

// 다시 시작하는 기능 함수 정의
function restartGame() {
    headX = 10;
    headY = 10;
    velocityX = 0;
    velocityY = 0;
    snakeParts = [];
    tailLength = 2;
    score = 0;
    speed = 7; 
    
    canChangeDirection = true;
    
    obstacles = []; 
    clearInterval(obstacleTimer);
    startObstacleTimer(); 

    document.getElementById('score').innerText = score;
    isGameOverFlag = false;
    
    restartBtn.style.display = "none";
    
    drawGame();
}

// 장애물을 생성시키기 위한 시간 함수 정의
// 세트인터벌 함수로 장애물 생성 시간 조정
function startObstacleTimer() {
    obstacleTimer = setInterval(() => {
        if (!isGameOverFlag && (velocityX !== 0 || velocityY !== 0)) { 
            spawnObstacles(5);
        }
    }, 10000); 
}

// 장애물 생성
function spawnObstacles(count) {
    let generated = 0;
    let attempts = 0; 

    while (generated < count && attempts < 100) {
        let rx = Math.floor(Math.random() * tileCount);
        let ry = Math.floor(Math.random() * tileCount);

        if (isValidPosition(rx, ry)) {
            obstacles.push({ x: rx, y: ry });
            generated++;
        }
        attempts++;
    }
    
    if (generated > 0) {
        showMineMessage();
    }
}

// 지뢰 메시지
function showMineMessage() {
    mineMsg.classList.add("show");
    setTimeout(() => {
        mineMsg.classList.remove("show");
    }, 1500); 
}

// 뱀의 머리 주변에 지뢰가 생성되지 않도록 하는 함수 지정
// 가까우면 false를 반환해서 다시 생성하는 과정을 거침
function isValidPosition(x, y) {
    if (x === headX && y === headY) return false;

    for (let part of snakeParts) {
        if (part.x === x && part.y === y) return false;
    }

    if (x === appleX && y === appleY) return false;

    for (let obs of obstacles) {
        if (obs.x === x && obs.y === y) return false;
    }

    const distance = Math.abs(x - headX) + Math.abs(y - headY);
    if (distance <= 5) return false;

    return true;
}

// 화면 지우기
function clearScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 배경 함수
function drawCheckeredBackground() {
    const color1 = "#AAD751"; 
    const color2 = "#A2D149"; 

    ctx.shadowBlur = 0;

    for (let i = 0; i < tileCount; i++) {
        for (let j = 0; j < tileCount; j++) {
            ctx.fillStyle = (i + j) % 2 == 0 ? color1 : color2;
            ctx.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
        }
    }
}

//뱀 디자인
function drawSnake() {
    snakeParts.push(new SnakePart(headX, headY));
    while (snakeParts.length > tailLength) {
        snakeParts.shift();
    }

    let snakeColor = "#4674E9"; 
    let snakeThickness = tileSize - 4; 
    let glowColor = "transparent"; 
    let glowAmount = 0;


// if문으로 점수에 따라 디자인 변경되는 시스템
    if (score < 2) {
        snakeColor = "#FFB6C1"; 
        snakeThickness = tileSize - 8; 
    } else if (score < 4) {
        snakeColor = "#4674E9"; 
        snakeThickness = tileSize - 4; 
    } else if (score < 6) {
        snakeColor = "#228B22"; 
        snakeThickness = tileSize - 1; 
    } else {
        snakeColor = "#FFD700"; 
        snakeThickness = tileSize - 4;
        glowColor = "orange"; 
        glowAmount = 20;
    }

    if (snakeParts.length > 0) {
        ctx.strokeStyle = snakeColor;
        ctx.lineWidth = snakeThickness;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowAmount;

        ctx.beginPath();
        let firstPart = snakeParts[0];
        ctx.moveTo(firstPart.x * tileSize + tileSize/2, firstPart.y * tileSize + tileSize/2);

        for (let i = 1; i < snakeParts.length; i++) {
            let part = snakeParts[i];
            ctx.lineTo(part.x * tileSize + tileSize/2, part.y * tileSize + tileSize/2);
        }
        ctx.lineTo(headX * tileSize + tileSize/2, headY * tileSize + tileSize/2);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    } 

    drawEyes();
}

function drawCircle(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawEyes() {
    ctx.fillStyle = "white"; 
    let centerX = headX * tileSize + tileSize / 2;
    let centerY = headY * tileSize + tileSize / 2;
    
    let eyeOffset = tileSize / 4;
    let eyeRadius = tileSize / 6;

    if (score < 2) eyeRadius = tileSize / 8;

    drawCircle(centerX - eyeOffset, centerY - eyeOffset, eyeRadius); 
    drawCircle(centerX + eyeOffset, centerY - eyeOffset, eyeRadius); 
    
    if (score >= 4 && score < 6) {
        ctx.fillStyle = "red"; 
    } else if (score >= 6) {
        ctx.fillStyle = "#8B0000"; 
    } else {
        ctx.fillStyle = "black"; 
    }
    
    drawCircle(centerX - eyeOffset, centerY - eyeOffset, eyeRadius/2); 
    drawCircle(centerX + eyeOffset, centerY - eyeOffset, eyeRadius/2); 
}

// 사과
function drawApple() {
    ctx.fillStyle = "#e7471d";
    let centerX = appleX * tileSize + tileSize / 2;
    let centerY = appleY * tileSize + tileSize / 2;
    let radius = tileSize / 2.5; 

    drawCircle(centerX, centerY, radius);
}

// 장애물 디자인
function drawObstacles() {
    ctx.fillStyle = "#555555"; 
    ctx.shadowBlur = 0;

    for (let obs of obstacles) {
        ctx.fillRect(obs.x * tileSize + 2, obs.y * tileSize + 2, tileSize - 4, tileSize - 4);
        
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(obs.x * tileSize + 5, obs.y * tileSize + 5);
        ctx.lineTo(obs.x * tileSize + tileSize - 5, obs.y * tileSize + tileSize - 5);
        ctx.moveTo(obs.x * tileSize + tileSize - 5, obs.y * tileSize + 5);
        ctx.lineTo(obs.x * tileSize + 5, obs.y * tileSize + tileSize - 5);
        ctx.stroke();
    }
}

// 7. 사과 충돌
function checkAppleCollision() {
    if (appleX === headX && appleY === headY) {
        
        tailLength++;
        score++;
        document.getElementById('score').innerText = score;

        if (score % 5 === 0 && speed < 20) {
            speed += 1; 
            showSpeedMessage(); 
        }

        let newAppleX, newAppleY;
        while (true) {
            newAppleX = Math.floor(Math.random() * tileCount);
            newAppleY = Math.floor(Math.random() * tileCount);
            
            let isSafe = true;
            for (let part of snakeParts) {
                if (part.x === newAppleX && part.y === newAppleY) isSafe = false;
            }
            for (let obs of obstacles) {
                if (obs.x === newAppleX && obs.y === newAppleY) isSafe = false;
            }
            if(newAppleX === headX && newAppleY === headY) isSafe = false;

            if (isSafe) break;
        }
        appleX = newAppleX;
        appleY = newAppleY;
    }
}

function showSpeedMessage() {
    speedMsg.classList.add("show");
    setTimeout(() => {
        speedMsg.classList.remove("show");
    }, 1500);
}

// 8. 위치 업데이트
function changeSnakePosition() {
    headX += velocityX;
    headY += velocityY;
}

// 9. 키 입력
document.body.addEventListener('keydown', keyDown);

function keyDown(event) {
    if (!obstacleTimer && !isGameOverFlag && (event.keyCode >= 37 && event.keyCode <= 40)) {
        startObstacleTimer();
    }
    // 마우스로 일일이 누를 필요없이 엔터키로 restartGame함수 실행, 키보드만으로 할 수 있게 작업
    if (isGameOverFlag) {
        if (event.keyCode == 13) restartGame();
        return; 
    }

    // 위에서 작성된 기능 중 연속적으로 키를 눌러도 죽지 않게끔 하는 예외처리 함수
    if (!canChangeDirection) return;

    let directionChanged = false; // 확인

    if (event.keyCode == 38) { // 위
        if (velocityY == 1) return;
        velocityX = 0; velocityY = -1;
        directionChanged = true;
    }
    if (event.keyCode == 40) { // 아래
        if (velocityY == -1) return;
        velocityX = 0; velocityY = 1;
        directionChanged = true;
    }
    if (event.keyCode == 37) { // 왼
        if (velocityX == 1) return;
        velocityX = -1; velocityY = 0;
        directionChanged = true;
    }
    if (event.keyCode == 39) { // 오른
        if (velocityX == -1) return;
        velocityX = 1; velocityY = 0;
        directionChanged = true;
    }

    // 만약에 방향 전환이 참이면 입력 방지 함수를 false로 만들어서 입력 받기
    if (directionChanged) {
        canChangeDirection = false;
    }
}

drawGame();