import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameManager } from './game';
import { GameState } from './types/game';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"]
  }
});

const gameManager = new GameManager();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinRoom', async ({ roomId }) => {
    try {
      // Leave any existing rooms
      const currentRooms = Array.from(socket.rooms);
      await Promise.all(
        currentRooms
          .filter(room => room !== socket.id)
          .map(room => socket.leave(room))
      );

      // Get or create room
      let room = gameManager.getRoom(roomId);
      if (!room) {
        room = gameManager.createRoom(roomId);
        console.log(`Created new room: ${roomId}`);
      }

      // Check if room is full
      if (room.players.length >= 6) {
        socket.emit('error', 'Room is full');
        return;
      }

      // Check if game is in progress
      if (room.gameState !== GameState.WAITING) {
        socket.emit('error', 'Game is already in progress');
        return;
      }

      // Add player to room
      const updatedRoom = gameManager.addPlayer(roomId, socket.id, `Player ${room.players.length + 1}`);
      if (!updatedRoom) {
        socket.emit('error', 'Failed to join room');
        return;
      }

      // Join socket room and broadcast state
      await socket.join(roomId);
      io.to(roomId).emit('roomState', updatedRoom);
      console.log(`Player ${socket.id} joined room ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', 'Failed to join room');
    }
  });

  socket.on('startGame', ({ roomCode }) => {
    try {
      const room = gameManager.getRoom(roomCode);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      // Verify sender is host
      if (socket.id !== room.host) {
        socket.emit('error', 'Only the host can start the game');
        return;
      }

      // Check minimum players
      if (room.players.length < 2) {
        socket.emit('error', 'Need at least 2 players to start');
        return;
      }

      // Start game
      const updatedRoom = gameManager.startGame(roomCode);
      if (!updatedRoom) {
        socket.emit('error', 'Failed to start game');
        return;
      }

      // Broadcast updated state
      io.to(roomCode).emit('roomState', updatedRoom);
      console.log(`Game started in room ${roomCode}`);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('error', 'Failed to start game');
    }
  });

  socket.on('placePlayer', ({ roomCode, nodeId }) => {
    try {
      const room = gameManager.getRoom(roomCode);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      // Verify it's player's turn
      if (socket.id !== room.currentTurn) {
        socket.emit('error', 'Not your turn');
        return;
      }

      const updatedRoom = gameManager.placePlayer(roomCode, socket.id, nodeId);
      if (!updatedRoom) {
        socket.emit('error', 'Invalid placement');
        return;
      }

      io.to(roomCode).emit('roomState', updatedRoom);
    } catch (error) {
      console.error('Error placing player:', error);
      socket.emit('error', 'Failed to place player');
    }
  });

  socket.on('makeMove', ({ roomCode, nodeId, transportType }) => {
    try {
      const room = gameManager.getRoom(roomCode);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      // Verify it's player's turn
      if (socket.id !== room.currentTurn) {
        socket.emit('error', 'Not your turn');
        return;
      }

      const updatedRoom = gameManager.movePlayer(roomCode, socket.id, nodeId, transportType);
      if (!updatedRoom) {
        socket.emit('error', 'Invalid move');
        return;
      }

      // If Mr. X moved, notify other players
      const player = room.players.find(p => p.id === socket.id);
      if (player?.role === 'mrx') {
        io.to(roomCode).emit('mrxMoved');
      }

      // Check if it's a reveal turn
      if (updatedRoom.mrxLastKnownPosition && updatedRoom.mrxLastKnownTurn === updatedRoom.turnNumber) {
        io.to(roomCode).emit('mrxLocationReveal');
      }

      io.to(roomCode).emit('roomState', updatedRoom);
    } catch (error) {
      console.error('Error making move:', error);
      socket.emit('error', 'Failed to make move');
    }
  });

  socket.on('disconnecting', () => {
    try {
      // Handle player disconnection for each room they're in
      socket.rooms.forEach(roomId => {
        if (roomId !== socket.id) {
          const updatedRoom = gameManager.removePlayer(roomId, socket.id);
          if (updatedRoom) {
            io.to(roomId).emit('roomState', updatedRoom);
            console.log(`Player ${socket.id} left room ${roomId}`);
          }
        }
      });
    } catch (error) {
      console.error('Error handling disconnection:', error);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 