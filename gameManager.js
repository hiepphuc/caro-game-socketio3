class Game {
    constructor(roomId) {
        this.roomId = roomId;
        this.size = 15;
        this.board = this.initBoard();
        this.turn = 'X';
        this.players = []; // Lưu socket.id của người chơi
        this.symbols = {}; // Map socket.id => ký hiệu ('X' hoặc 'O')
        this.isOver = false;
    }

    initBoard() {
        return Array.from({ length: this.size }, () => Array(this.size).fill(null));
    }

    addPlayer(socketId) {
        if (this.players.length < 2) {
            this.players.push(socketId);
            // Người chơi đầu tiên được 'X', người thứ hai là 'O'
            this.symbols[socketId] = this.players.length === 1 ? 'X' : 'O';
            return true;
        }
        return false;
    }

    playMove(row, col, socketId) {
        if (this.isOver) {
            return { success: false, message: 'Trò chơi đã kết thúc.' };
        }
        if (this.board[row][col] !== null) {
            return { success: false, message: 'Ô này đã được đánh.' };
        }
        // Kiểm tra lượt chơi
        if (this.symbols[socketId] !== this.turn) {
            return { success: false, message: 'Chưa đến lượt bạn đánh.' };
        }
        // Đánh nước cờ
        this.board[row][col] = this.turn;
        // Kiểm tra thắng cuộc
        if (this.checkWin(row, col)) {
            this.isOver = true;
            return { success: true, winner: this.turn };
        }
        // Kiểm tra hòa: bàn cờ đầy
        if (this.board.flat().every(cell => cell !== null)) {
            this.isOver = true;
            return { success: true, winner: 'draw' };
        }
        // Chuyển lượt
        this.turn = this.turn === 'X' ? 'O' : 'X';
        return { success: true };
    }

    // Kiểm tra thắng cuộc (nối 5)
    checkWin(row, col) {
        const directions = [
            { dr: 0, dc: 1 },  // Ngang
            { dr: 1, dc: 0 },  // Dọc
            { dr: 1, dc: 1 },  // Chéo chính
            { dr: 1, dc: -1 }  // Chéo phụ
        ];
        const current = this.board[row][col];
        const inARowNeeded = 5;

        for (let { dr, dc } of directions) {
            let count = 1;
            // Kiểm tra hướng tiến
            let r = row + dr, c = col + dc;
            while (this.isValid(r, c) && this.board[r][c] === current) {
                count++;
                r += dr;
                c += dc;
            }
            // Kiểm tra hướng lùi
            r = row - dr;
            c = col - dc;
            while (this.isValid(r, c) && this.board[r][c] === current) {
                count++;
                r -= dr;
                c -= dc;
            }
            if (count >= inARowNeeded) {
                return true;
            }
        }
        return false;
    }

    isValid(row, col) {
        return row >= 0 && row < this.size && col >= 0 && col < this.size;
    }

    // Trả về trạng thái hiện tại của game để gửi cho client
    getGameState() {
        return {
            board: this.board,
            turn: this.turn,
            players: this.players,
            isOver: this.isOver
        };
    }
}

module.exports = Game;
