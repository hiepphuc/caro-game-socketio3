const socket = io();

let roomId = prompt("Nhập mã phòng (ví dụ: room1):") || "room1";
socket.emit('joinRoom', roomId);

const boardDiv = document.getElementById('board');
const statusP = document.getElementById('status');
const joinBtn = document.getElementById('joinBtn');

let gameState = null;

// Hàm render lại bàn cờ
function renderBoard() {
    boardDiv.innerHTML = '';
    if (!gameState) return;
    for (let i = 0; i < gameState.board.length; i++) {
        for (let j = 0; j < gameState.board[i].length; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell', `${gameState.board[i][j]}`);
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.textContent = gameState.board[i][j] ? gameState.board[i][j] : '';
            cell.addEventListener('click', () => {
                if (!gameState.isOver) {
                    socket.emit('playMove', { roomId, row: i, col: j });
                }
            });
            boardDiv.appendChild(cell);
        }
    }
}

socket.on('update', (state) => {
    gameState = state;
    if (gameState.isOver) {
        statusP.textContent = gameState.turn === 'X' || gameState.turn === 'O'
            ? `Người chơi ${gameState.turn} thắng!`
            : 'Trò chơi hòa!';
    } else {
        statusP.textContent = `Đến lượt người chơi ${gameState.turn}`;
    }
    renderBoard();
});

socket.on('gameOver', (data) => {
    if (data.winner === 'draw') {
        statusP.textContent = 'Trò chơi hòa!';
    } else {
        statusP.textContent = `Người chơi ${data.winner} thắng!`;
    }
});

socket.on('errorMessage', (msg) => {
    alert(msg);
});

joinBtn.addEventListener('click', () => {
    roomId = prompt("Nhập mã phòng mới:") || "room1";
    socket.emit('joinRoom', roomId);
});
