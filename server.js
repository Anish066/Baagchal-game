const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

const rooms = {};

function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('createRoom', () => {
        let roomCode;
        do {
            roomCode = generateRoomCode();
        } while (rooms[roomCode]);
        rooms[roomCode] = { players: [socket.id], gameState: null };
        socket.join(roomCode);
        socket.emit('roomCreated', { roomCode });
        console.log(`Room created: ${roomCode} by ${socket.id}`);
    });

    socket.on('joinRoom', (data) => {
        const roomCode = data.roomCode;
        if (!rooms[roomCode]) {
            socket.emit('error', { message: 'Invalid room code!' });
            return;
        }
        if (rooms[roomCode].players.length >= 2) {
            socket.emit('error', { message: 'Room is full!' });
            return;
        }
        rooms[roomCode].players.push(socket.id);
        socket.join(roomCode);
        socket.emit('roomJoined', { roomCode });
        io.to(roomCode).emit('opponentJoined');
        console.log(`Player ${socket.id} joined room ${roomCode}`);
    });

    socket.on('move', (data) => {
        const roomCode = data.roomCode;
        if (rooms[roomCode]) {
            socket.to(roomCode).emit('opponentMove', data);
        }
    });

    socket.on('gameState', (data) => {
        const roomCode = data.roomCode;
        if (rooms[roomCode]) {
            rooms[roomCode].gameState = data;
            socket.to(roomCode).emit('gameState', data);
        }
    });

    socket.on('gameOver', (data) => {
        const roomCode = data.roomCode;
        if (rooms[roomCode]) {
            io.to(roomCode).emit('gameOver', { winner: data.winner });
            delete rooms[roomCode];
        }
    });

    socket.on('disconnect', () => {
        for (let roomCode in rooms) {
            const room = rooms[roomCode];
            const playerIndex = room.players.indexOf(socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                socket.to(roomCode).emit('opponentDisconnected');
                if (room.players.length === 0) {
                    delete rooms[roomCode];
                }
                console.log(`Player ${socket.id} disconnected from room ${roomCode}`);
                break;
            }
        }
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});