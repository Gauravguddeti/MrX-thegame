import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import GameLobby from '../components/GameLobby';
import { GameMap } from '../components/GameMap';
import { Room, GameState, TransportType } from '../types/game';
import { motion, AnimatePresence } from 'framer-motion';

export const Game: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [gameMessage, setGameMessage] = useState<string>('');
  const [showMrXLocation, setShowMrXLocation] = useState(false);
  const [turnAnimation, setTurnAnimation] = useState<string>('');
  const [showRolePopup, setShowRolePopup] = useState(false);
  const [roleMessage, setRoleMessage] = useState<string>('');

  useEffect(() => {
    if (!socket || !roomId) {
      navigate('/');
      return;
    }

    // Join room
    socket.emit('joinRoom', { roomId });

    // Handle room state updates
    socket.on('roomState', (updatedRoom: Room) => {
      console.log('Room state updated:', updatedRoom);
      setRoom(updatedRoom);
      setLoading(false);
      setError(null);

      // Show role popup when game starts
      if (updatedRoom.gameState === GameState.MRX_PLACEMENT) {
        const player = updatedRoom.players.find(p => p.id === socket.id);
        if (player) {
          setRoleMessage(player.role === 'mrx' 
            ? "You are Mr. X! Choose your starting location carefully and try to evade the detectives."
            : "You are a detective! Work with other detectives to catch Mr. X.");
          setShowRolePopup(true);
          setTimeout(() => setShowRolePopup(false), 5000);
        }
      }

      // Show turn animations
      if (updatedRoom.gameState === GameState.MRX_PLACEMENT) {
        const isMrX = updatedRoom.players.find(p => p.id === socket.id)?.role === 'mrx';
        setTurnAnimation(isMrX ? "Choose your starting position" : "Waiting for Mr. X to choose starting position");
      } else if (updatedRoom.gameState === GameState.DETECTIVE_PLACEMENT) {
        const currentPlayer = updatedRoom.players.find(p => p.id === updatedRoom.currentTurn);
        setTurnAnimation(currentPlayer?.id === socket.id 
          ? "Choose your starting position"
          : `Waiting for ${currentPlayer?.name} to choose starting position`);
      } else if (updatedRoom.gameState === GameState.IN_PROGRESS) {
        const currentPlayer = updatedRoom.players.find(p => p.id === updatedRoom.currentTurn);
        if (currentPlayer?.role === 'mrx') {
          setTurnAnimation(currentPlayer.id === socket.id 
            ? "Your turn - Make your move carefully"
            : "Mr. X is planning their next move...");
        } else {
          setTurnAnimation(currentPlayer?.id === socket.id 
            ? "Your turn - Try to catch Mr. X!"
            : `Waiting for ${currentPlayer?.name} to move`);
        }
      }
    });

    // Handle errors
    socket.on('error', (message: string) => {
      console.error('Game error:', message);
      setError(message);
      setLoading(false);
    });

    socket.on('gameMessage', (message: string) => {
      setGameMessage(message);
      setTimeout(() => setGameMessage(''), 3000);
    });

    socket.on('mrxLocationReveal', () => {
      setShowMrXLocation(true);
      setTimeout(() => setShowMrXLocation(false), 5000);
    });

    socket.on('mrxMoved', () => {
      setGameMessage("Mr. X has made their move!");
      setTimeout(() => setGameMessage(''), 3000);
    });

    // Cleanup
    return () => {
      socket.off('roomState');
      socket.off('error');
      socket.off('gameMessage');
      socket.off('mrxLocationReveal');
      socket.off('mrxMoved');
      socket.emit('leaveRoom', { roomId });
    };
  }, [socket, roomId, navigate]);

  const handleStartGame = () => {
    if (!socket || !room) return;
    socket.emit('startGame', { roomCode: room.code });
  };

  const handleNodeSelect = (nodeId: string) => {
    if (!socket || !room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    if (room.gameState === GameState.MRX_PLACEMENT || room.gameState === GameState.DETECTIVE_PLACEMENT) {
      socket.emit('placePlayer', { roomCode: room.code, nodeId });
    } else if (room.gameState === GameState.IN_PROGRESS && room.currentTurn === player.id) {
      if (!player.position) {
        socket.emit('placePlayer', { roomCode: room.code, nodeId });
      } else if (selectedNode === nodeId) {
        setSelectedNode(null);
      } else {
        setSelectedNode(nodeId);
      }
    }
  };

  const handleTransportSelect = (transportType: TransportType) => {
    if (!socket || !room || !selectedNode) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    
    socket.emit('makeMove', {
      roomCode: room.code,
      nodeId: selectedNode,
      transportType
    });
    setSelectedNode(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading game...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Error</h2>
          <p className="text-red-500 text-center mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Room Not Found</h2>
          <p className="text-gray-400 text-center mb-6">The room you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Show lobby if game hasn't started
  if (room.gameState === GameState.WAITING) {
    return <GameLobby room={room} onStartGame={handleStartGame} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Role Announcement Popup */}
      <AnimatePresence>
        {showRolePopup && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     bg-gray-800 p-6 rounded-lg shadow-lg z-50 max-w-md w-full text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Your Role</h2>
            <p className="text-lg">{roleMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Header */}
      <div className="absolute top-0 left-0 right-0 bg-gray-800 p-4 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hunt Mr. X</h1>
            <p className="text-gray-400">Room: {room?.code}</p>
          </div>
          <div className="text-center flex-grow">
            <AnimatePresence mode="wait">
              <motion.p
                key={turnAnimation}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="text-xl font-bold"
              >
                {turnAnimation}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="text-right">
            <p className="text-lg">Turn {room?.turnNumber}</p>
            <p className="text-gray-400">
              {socket && room?.currentTurn === socket.id ? "Your turn" : "Waiting for other player"}
            </p>
          </div>
        </div>
      </div>

      {/* Game Map */}
      <div className="pt-20 pb-4 px-4">
        <div className="max-w-7xl mx-auto">
          <GameMap
            room={room}
            currentPlayer={room.players.find(p => p.id === socket?.id)}
            onNodeSelect={handleNodeSelect}
          />
        </div>
      </div>

      {/* Transport Selection */}
      <AnimatePresence>
        {selectedNode && room.players.find(p => p.id === socket?.id)?.position && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 p-4 rounded-lg shadow-lg z-20"
          >
            <div className="grid grid-cols-4 gap-2">
              {room.players.find(p => p.id === socket?.id)?.tickets && 
                Object.entries(room.players.find(p => p.id === socket?.id)!.tickets).map(([type, count]) => {
                  const transportType = type as TransportType;
                  return (
                    <button
                      key={`transport-${type}`}
                      className={`px-4 py-2 rounded flex flex-col items-center ${
                        count > 0
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                      disabled={count === 0}
                      onClick={() => handleTransportSelect(transportType)}
                    >
                      <span className="capitalize text-sm">{type}</span>
                      <span className="text-xs mt-1">{count}</span>
                    </button>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Messages */}
      <AnimatePresence>
        {gameMessage && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 px-6 py-3 rounded-lg shadow-lg z-30"
          >
            <p className="text-white text-lg">{gameMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mr. X Location Reveal */}
      <AnimatePresence>
        {showMrXLocation && room.mrxLastKnownPosition && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 px-8 py-6 rounded-lg shadow-lg z-40"
          >
            <h2 className="text-2xl font-bold mb-2">Mr. X Spotted!</h2>
            <p className="text-lg">Last seen at: {room.mrxLastKnownPosition}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Screen */}
      <AnimatePresence>
        {room.gameState === GameState.FINISHED && room.winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 p-8 rounded-lg text-center"
            >
              <h2 className="text-3xl font-bold mb-4">
                {room.winner === 'mrx' ? 'Mr. X Wins!' : 'Detectives Win!'}
              </h2>
              <p className="text-xl mb-6">
                {room.winner === 'mrx'
                  ? 'Mr. X has successfully evaded capture!'
                  : 'The detectives have caught Mr. X!'}
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold"
              >
                Back to Home
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Game; 