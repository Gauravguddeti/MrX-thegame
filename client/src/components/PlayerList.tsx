import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Room, GameState } from '../types';

interface PlayerListProps {
  room: Room;
}

const PlayerList: React.FC<PlayerListProps> = ({ room }) => {
  const { socket } = useSocket();
  const currentPlayer = room.players.find(p => p.id === socket?.id);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Players</h2>
      <div className="space-y-2">
        {room.players.map((player) => (
          <div
            key={player.id}
            className={`rounded-lg p-3 ${
              player.id === socket?.id
                ? 'bg-indigo-900 text-white'
                : 'bg-gray-700 text-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {player.name}
                  {player.isHost && (
                    <span className="ml-2 text-xs text-yellow-400">(Host)</span>
                  )}
                </p>
                {room.gameState === GameState.PLAYING && player.role && (
                  <p className="text-sm text-gray-400">
                    {player.id === socket?.id || player.role === 'detective'
                      ? player.role.charAt(0).toUpperCase() + player.role.slice(1)
                      : 'Unknown'}
                  </p>
                )}
              </div>
              {room.gameState === GameState.LOBBY &&
                currentPlayer?.isHost &&
                !player.isHost && (
                  <button
                    onClick={() =>
                      socket?.emit('kickPlayer', { roomCode: room.code, playerId: player.id })
                    }
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Kick
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>
      {room.gameState === GameState.LOBBY && (
        <p className="text-sm text-gray-400">
          {room.players.length < 3
            ? `Waiting for players... (${3 - room.players.length} more needed)`
            : 'Ready to start!'}
        </p>
      )}
    </div>
  );
};

export default PlayerList; 