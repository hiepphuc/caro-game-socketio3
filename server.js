const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Game = require('./gameManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Cấu hình server để phục vụ các file tĩnh từ thư mục public
app.use(express.static('public'));

const games = {}; // Lưu trữ các game theo roomId

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Khi người chơi tham gia phòng
    socket.on('joinRoom', (roomId) => {
        // Nếu chưa có game nào của phòng này thì tạo mới
        if (!games[roomId]) {
            games[roomId] = new Game(roomId);
        }
        const game = games[roomId];
        if (game.addPlayer(socket.id)) {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
            io.to(roomId).emit('update', game.getGameState());
        } else {
            socket.emit('errorMessage', 'Phòng đã đầy.');
        }
    });

    // Khi người chơi đánh một nước cờ
    socket.on('playMove', ({ roomId, row, col }) => {
        const game = games[roomId];
        if (game) {
            const result = game.playMove(row, col, socket.id);
            if (result.success) {
                io.to(roomId).emit('update', game.getGameState());
                if (result.winner) {
                    io.to(roomId).emit('gameOver', { winner: result.winner });
                }
            } else {
                socket.emit('errorMessage', result.message);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`);
        // Bạn có thể bổ sung xử lý rời phòng (notify đối thủ, xoá game, ...) ở đây nếu cần.
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
