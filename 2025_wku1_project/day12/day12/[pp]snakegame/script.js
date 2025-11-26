const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");
const speedMsg = document.getElementById("speedMsg"); // 속도 알림창

// --- 게임 설정 ---
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
    drawSnake(); // ★ 진화하는 뱀 그리기

    setTimeout(drawGame, 1000 / speed);
}

// 1. 게임 종료 처리
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

    if (gameOver) {
        isGameOverFlag = true; 

        ctx.fillStyle = "white";
        ctx.font = "bold 50px Arial";
        ctx.textAlign = "center";
        
        // 그림자 효과 제거 (글씨 깨짐 방지)
        ctx.shadowBlur = 0; 
        
        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
        
        ctx.font = "15px Arial";
        ctx.fillText("Press Enter to Restart", canvas.width / 2, canvas.height / 2 + 30);

        restartBtn.style.display = "block";
    }
    return gameOver;
}

// 2. 다시 시작
function restartGame() {
    headX = 10;
    headY = 10;
    velocityX = 0;
    velocityY = 0;
    snakeParts = [];
    tailLength = 2;
    score = 0;
    speed = 7; // 속도 초기화
    document.getElementById('score').innerText = score;
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

    // 배경 그릴 땐 그림자 효과 끄기
    ctx.shadowBlur = 0;

    for (let i = 0; i < tileCount; i++) {
        for (let j = 0; j < tileCount; j++) {
            ctx.fillStyle = (i + j) % 2 == 0 ? color1 : color2;
            ctx.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
        }
    }
}

// 5. ★ [핵심] 성장형 뱀 그리기
function drawSnake() {
    snakeParts.push(new SnakePart(headX, headY));
    while (snakeParts.length > tailLength) {
        snakeParts.shift();
    }

    // --- 단계별 스킨 설정 ---
    let snakeColor = "#4674E9"; // 기본 파랑
    let snakeThickness = tileSize - 4; // 기본 두께
    let glowColor = "transparent"; // 기본은 발광 없음
    let glowAmount = 0;

    if (score < 2) {
        // [1단계: 아기 지렁이]
        snakeColor = "#FFB6C1"; // 분홍색
        snakeThickness = tileSize - 8; // 작고 얇음
    } else if (score < 4) {
        // [2단계: 일반 뱀]
        snakeColor = "#4674E9"; // 파란색
        snakeThickness = tileSize - 4; // 보통
    } else if (score < 6) {
        // [3단계: 숲의 아나콘다]
        snakeColor = "#228B22"; // 진한 녹색
        snakeThickness = tileSize - 1; // 뚱뚱함 (거의 꽉 참)
    } else {
        // [4단계: 황금 드래곤 (50점 이상)]
        snakeColor = "#FFD700"; // 황금색
        snakeThickness = tileSize - 4;
        glowColor = "orange"; // 번쩍이는 효과
        glowAmount = 20;
    }

    if (snakeParts.length > 0) {
        // 스타일 적용
        ctx.strokeStyle = snakeColor;
        ctx.lineWidth = snakeThickness;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        // 발광 효과 적용 (드래곤 모드일 때만 보임)
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
        
        // 그림자 초기화 (다른 그림에 영향 안 주게)
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
    ctx.fillStyle = "white"; // 흰자위
    let centerX = headX * tileSize + tileSize / 2;
    let centerY = headY * tileSize + tileSize / 2;
    
    let eyeOffset = tileSize / 4;
    let eyeRadius = tileSize / 6;

    // 아기 지렁이일 때는 눈도 작게
    if (score < 2) eyeRadius = tileSize / 8;

    drawCircle(centerX - eyeOffset, centerY - eyeOffset, eyeRadius); 
    drawCircle(centerX + eyeOffset, centerY - eyeOffset, eyeRadius); 
    
    // --- 눈동자 색깔 변화 ---
    if (score >= 4 && score < 6) {
        ctx.fillStyle = "red"; // 아나콘다: 빨간 눈 (사나움)
    } else if (score >= 6) {
        ctx.fillStyle = "#8B0000"; // 드래곤: 진한 붉은색
    } else {
        ctx.fillStyle = "black"; // 기본: 검은 눈
    }
    
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

// 7. 사과 충돌 (속도 증가 기능 포함)
function checkAppleCollision() {
    if (appleX === headX && appleY === headY) {
        appleX = Math.floor(Math.random() * tileCount);
        appleY = Math.floor(Math.random() * tileCount);
        tailLength++;
        score++;
        document.getElementById('score').innerText = score;

        // 5점마다 속도 증가
        if (score % 5 === 0 && speed < 20) {
            speed += 1; 
            showSpeedMessage(); 
        }
    }
}

// 속도 알림창 표시 함수
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
    if (isGameOverFlag) {
        if (event.keyCode == 13) restartGame();
        return; 
    }

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

drawGame();