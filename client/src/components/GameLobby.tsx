import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Room, TransportType } from '../types/game';
import { motion } from 'framer-motion';

interface GameLobbyProps {
  room: Room;
  onStartGame: () => void;
}

const TRANSPORT_INFO: Record<TransportType, { name: string; description: string }> = {
  rickshaw: {
    name: 'Rickshaw',
    description: 'Short distance travel through narrow streets'
  },
  bus: {
    name: 'Bus',
    description: 'Medium distance travel along main roads'
  },
  metro: {
    name: 'Metro',
    description: 'Fast travel between major stations'
  },
  train: {
    name: 'Train',
    description: 'Long distance travel connecting outer areas'
  }
};

const GameLobby: React.FC<GameLobbyProps> = ({ room, onStartGame }) => {
  const { socket } = useSocket();
  const isHost = socket?.id === room.host;

  // Sort players so host is always first, then by join time
  const sortedPlayers = [...room.players].sort((a, b) => {
    if (a.isHost) return -1;
    if (b.isHost) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Hunt Mr. X - Pune Edition</h1>
          <div className="flex items-center space-x-4">
            <p className="text-gray-400">Room Code: <span className="font-mono bg-gray-800 px-2 py-1 rounded">{room.code}</span></p>
            <p className="text-gray-400">Players: {room.players.length}/6</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-4">Game Rules</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Overview</h3>
                <p className="text-gray-300">
                  One player is Mr. X, trying to evade capture in Pune city. The other players are detectives working together to catch Mr. X.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Game Flow</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Mr. X moves first, followed by each detective</li>
                  <li>Players can only move along transport routes</li>
                  <li>Each move requires a transport ticket</li>
                  <li>Mr. X's location is revealed on turns 3, 8, and 13</li>
                  <li>Game ends when:
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>A detective catches Mr. X</li>
                      <li>Mr. X survives for 15 turns</li>
                      <li>Detectives run out of tickets</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Transport Types</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(TRANSPORT_INFO).map(([type, info]) => (
                    <div key={`transport-${type}`} className="bg-gray-700 p-4 rounded">
                      <h4 className="font-semibold mb-1">{info.name}</h4>
                      <p className="text-sm text-gray-300">{info.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-4">Players</h2>
            <div className="space-y-4">
              {sortedPlayers.map((player, index) => (
                <div
                  key={`player-${player.id}-${index}`}
                  className="flex items-center justify-between bg-gray-700 p-4 rounded"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: player.color }}
                    />
                    <span>{player.name}</span>
                    {player.isHost && (
                      <span className="text-xs bg-blue-500 px-2 py-1 rounded">Host</span>
                    )}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {player.role || 'Waiting...'}
                  </div>
                </div>
              ))}

              {room.players.length < 6 && (
                <div className="text-center text-gray-400 p-4 border-2 border-dashed border-gray-700 rounded">
                  Waiting for more players...
                </div>
              )}
            </div>

            {isHost && room.players.length >= 2 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartGame}
                className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Start Game
              </motion.button>
            )}

            {!isHost && room.players.length >= 2 && (
              <div className="text-center mt-6 text-gray-400">
                Waiting for host to start the game...
              </div>
            )}

            {room.players.length < 2 && (
              <div className="text-center mt-6 text-gray-400">
                Need at least 2 players to start...
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby; 