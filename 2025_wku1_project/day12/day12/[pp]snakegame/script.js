const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");
const speedMsg = document.getElementById("speedMsg");

// --- 게임 설정 ---
const tileCount = 20; 
const tileSize = canvas.width / tileCount; // 격자 크기 (20px)

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


// 뱀 몸통 클래스
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
    
    if (isGameOver()) {
        return;
    }

    clearScreen();
    drawCheckeredBackground();
    checkAppleCollision();
    drawApple();
    drawSnake(); 

    setTimeout(drawGame, 1000 / speed);
}

// 1. 게임 종료 처리
function isGameOver() {
    let gameOver = false;

    if (velocityX === 0 && velocityY === 0) return false;

    // 벽 충돌
    if (headX < 0 || headX >= tileCount || headY < 0 || headY >= tileCount) {
        gameOver = true;
    }

    // 자기 몸 충돌
    for (let part of snakeParts) {
        if (part.x === headX && part.y === headY) {
            gameOver = true;
        }
    }

    if (gameOver) {
        isGameOverFlag = true; 

        ctx.fillStyle = "white";
        ctx.font = "bold 50px Arial";
        ctx.textAlign = "center"; 
        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
        
        // 엔터키 안내 문구 추가 (선택사항)
        ctx.font = "15px Arial";
        ctx.fillText("Press Enter to Restart", canvas.width / 2, canvas.height / 2 + 30);

        restartBtn.style.display = "block";
    }
    return gameOver;
}

// 2. 다시 시작 버튼 기능
function restartGame() {
    headX = 10;
    headY = 10;
    velocityX = 0;
    velocityY = 0;
    snakeParts = [];
    tailLength = 2;
    score = 0;
    document.getElementById('score').innerText = score;
    
    speed = 7;

    isGameOverFlag = false;
    
    restartBtn.style.display = "none";
    
    drawGame();
}

// 3. 화면 지우기
function clearScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 4. 체크무늬 배경
function drawCheckeredBackground() {
    const color1 = "#AAD751"; 
    const color2 = "#A2D149"; 

    for (let i = 0; i < tileCount; i++) {
        for (let j = 0; j < tileCount; j++) {
            ctx.fillStyle = (i + j) % 2 == 0 ? color1 : color2;
            ctx.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
        }
    }
}

// 5. 뱀 그리기 (부드러운 버전)
function drawSnake() {
    snakeParts.push(new SnakePart(headX, headY));
    while (snakeParts.length > tailLength) {
        snakeParts.shift();
    }

    if (snakeParts.length > 0) {
        ctx.strokeStyle = "#4674E9"; 
        ctx.lineWidth = tileSize - 4; 
        ctx.lineCap = "round"; 
        ctx.lineJoin = "round"; 

        ctx.beginPath();
        let firstPart = snakeParts[0];
        ctx.moveTo(firstPart.x * tileSize + tileSize/2, firstPart.y * tileSize + tileSize/2);

        for (let i = 1; i < snakeParts.length; i++) {
            let part = snakeParts[i];
            ctx.lineTo(part.x * tileSize + tileSize/2, part.y * tileSize + tileSize/2);
        }
        ctx.lineTo(headX * tileSize + tileSize/2, headY * tileSize + tileSize/2);
        ctx.stroke();
    } else {
        ctx.fillStyle = "#4674E9";
        drawCircle(headX * tileSize + tileSize/2, headY * tileSize + tileSize/2, (tileSize-4)/2);
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

    drawCircle(centerX - eyeOffset, centerY - eyeOffset, eyeRadius); 
    drawCircle(centerX + eyeOffset, centerY - eyeOffset, eyeRadius); 
    
    ctx.fillStyle = "black";
    drawCircle(centerX - eyeOffset, centerY - eyeOffset, eyeRadius/2); 
    drawCircle(centerX + eyeOffset, centerY - eyeOffset, eyeRadius/2); 
}

// 6. 사과 그리기
function drawApple() {
    ctx.fillStyle = "#e7471d";
    let centerX = appleX * tileSize + tileSize / 2;
    let centerY = appleY * tileSize + tileSize / 2;
    let radius = tileSize / 2.5; 

    drawCircle(centerX, centerY, radius);
}

// 7. 사과 충돌
function checkAppleCollision() {
    if (appleX === headX && appleY === headY) {
        appleX = Math.floor(Math.random() * tileCount);
        appleY = Math.floor(Math.random() * tileCount);
        tailLength++;
        score++;
        document.getElementById('score').innerText = score;

        // ★ 속도 증가 로직 + 알림창 띄우기
        // 5점마다 속도 증가 (최대 속도 제한 20)
        if (score % 5 === 0 && speed < 20) {
            speed += 10; 
            showSpeedMessage(); // 알림 함수 호출!
        }
    }
}

// 8. 위치 업데이트
function changeSnakePosition() {
    headX += velocityX;
    headY += velocityY;
}

// 9. 키 입력 처리 (여기가 수정되었습니다!)
document.body.addEventListener('keydown', keyDown);

function keyDown(event) {
    
    // ★ 추가된 부분: 게임 오버일 때 엔터키(KeyCode 13)를 누르면 재시작
    if (isGameOverFlag) {
        if (event.keyCode == 13) { // Enter 키
            restartGame();
        }
        return; // 게임 오버 상태면 방향키 입력은 무시
    }

    // 방향키 조작
    // 상(38) 하(40) 좌(37) 우(39)
    if (event.keyCode == 38) {
        if (velocityY == 1) return;
        velocityX = 0; velocityY = -1;
    }
    if (event.keyCode == 40) {
        if (velocityY == -1) return;
        velocityX = 0; velocityY = 1;
    }
    if (event.keyCode == 37) {
        if (velocityX == 1) return;
        velocityX = -1; velocityY = 0;
    }
    if (event.keyCode == 39) {
        if (velocityX == -1) return;
        velocityX = 1; velocityY = 0;
    }
}

// 게임 시작
drawGame();

function showSpeedMessage() {
    // 1. 클래스를 추가해서 보이게 함
    speedMsg.classList.add("show");

    // 2. 1.5초(1500ms) 뒤에 클래스를 제거해서 다시 숨김
    setTimeout(() => {
        speedMsg.classList.remove("show");
    }, 1000);
}