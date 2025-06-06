import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [view, setView] = useState<'menu' | 'create' | 'join'>('menu');
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = () => {
    if (!socket) return;
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    // Generate a random room code
    const generatedRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    socket.emit('joinRoom', { roomId: generatedRoomCode, playerName });
    navigate(`/game/${generatedRoomCode}`);
  };

  const handleJoinRoom = () => {
    if (!socket) return;
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    socket.emit('joinRoom', { roomId: roomCode.toUpperCase(), playerName });
    navigate(`/game/${roomCode.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Hunt Mr. X</h1>
          <p className="text-gray-400">A multiplayer detective game set in Pune</p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500 text-white p-3 rounded text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {view === 'menu' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <button
                onClick={() => setView('create')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition"
              >
                Create Room
              </button>
              <button
                onClick={() => setView('join')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition"
              >
                Join Room
              </button>
            </motion.div>
          )}

          {(view === 'create' || view === 'join') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="playerName" className="block text-sm font-medium mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
              </div>

              {view === 'join' && (
                <div>
                  <label htmlFor="roomCode" className="block text-sm font-medium mb-2">
                    Room Code
                  </label>
                  <input
                    type="text"
                    id="roomCode"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter room code"
                    maxLength={6}
                  />
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setView('menu');
                    setError(null);
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
                >
                  Back
                </button>
                <button
                  onClick={view === 'create' ? handleCreateRoom : handleJoinRoom}
                  disabled={!playerName || (view === 'join' && !roomCode)}
                  className={`flex-1 ${
                    !playerName || (view === 'join' && !roomCode)
                      ? 'bg-blue-800 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white font-bold py-2 px-4 rounded transition`}
                >
                  {view === 'create' ? 'Create' : 'Join'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 