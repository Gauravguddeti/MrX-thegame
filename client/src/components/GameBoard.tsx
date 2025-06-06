import React, { useEffect, useRef, useState } from 'react';
import { Room, Player, MapNode, TransportType, GameState } from '../types/game';
import { gameMap } from '../gameMap';

interface GameBoardProps {
  room: Room;
  currentPlayer: Player | null;
}

const TRANSPORT_COLORS: Record<TransportType, string> = {
  rickshaw: '#4CAF50',
  bus: '#2196F3',
  metro: '#9C27B0',
  train: '#F44336'
};

const NODE_RADIUS = 20;
const CONNECTION_WIDTH = 4;

export const GameBoard: React.FC<GameBoardProps> = ({ room, currentPlayer }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);

  // Calculate valid moves for the current player
  useEffect(() => {
    if (!currentPlayer || room.currentTurn !== currentPlayer.id) {
      setValidMoves([]);
      return;
    }

    if (!currentPlayer.position && room.gameState === GameState.MRX_PLACEMENT) {
      // Mr. X can start from any start node
      setValidMoves(gameMap.nodes.filter(n => n.type === 'start').map(n => n.id));
    } else if (!currentPlayer.position && room.gameState === GameState.DETECTIVE_PLACEMENT) {
      // Detectives can start from any unoccupied start node
      const occupiedNodes = room.players.map(p => p.position).filter(Boolean);
      setValidMoves(
        gameMap.nodes
          .filter(n => n.type === 'start' && !occupiedNodes.includes(n.id))
          .map(n => n.id)
      );
    } else if (currentPlayer.position) {
      // During the game, players can move to connected nodes if they have the required tickets
      const currentNode = gameMap.nodes.find(n => n.id === currentPlayer.position);
      if (currentNode) {
        setValidMoves(
          currentNode.connections.filter(connId => {
            const targetNode = gameMap.nodes.find(n => n.id === connId);
            if (!targetNode) return false;
            // Check if player has tickets for any transport type available on this connection
            return targetNode.transportTypes.some(type => currentPlayer.tickets[type] > 0);
          })
        );
      }
    }
  }, [room, currentPlayer]);

  const drawNode = (
    ctx: CanvasRenderingContext2D,
    node: MapNode,
    scale: number = 1
  ) => {
    const [x, y] = node.position;
    const scaledX = x * 100 + 400;
    const scaledY = y * 100 + 300;

    // Draw node circle
    ctx.beginPath();
    ctx.arc(scaledX, scaledY, NODE_RADIUS * scale, 0, Math.PI * 2);
    
    // Set node color based on type and state
    if (validMoves.includes(node.id)) {
      ctx.fillStyle = '#FFC107';
    } else if (node.type === 'start') {
      ctx.fillStyle = '#4CAF50';
    } else if (node.type === 'escape') {
      ctx.fillStyle = '#F44336';
    } else {
      ctx.fillStyle = '#2196F3';
    }

    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw node name
    ctx.fillStyle = '#fff';
    ctx.font = `${12 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.name, scaledX, scaledY + NODE_RADIUS * 1.5 * scale);

    // Draw players on the node
    const playersOnNode = room.players.filter(p => p.position === node.id);
    if (playersOnNode.length > 0) {
      playersOnNode.forEach((player, index) => {
        const angle = (index * Math.PI * 2) / playersOnNode.length;
        const playerX = scaledX + Math.cos(angle) * NODE_RADIUS;
        const playerY = scaledY + Math.sin(angle) * NODE_RADIUS;

        ctx.beginPath();
        ctx.arc(playerX, playerY, 5, 0, Math.PI * 2);
        ctx.fillStyle = player.role === 'mrx' ? '#000' : '#fff';
        ctx.fill();
        ctx.stroke();
      });
    }
  };

  const drawConnection = (
    ctx: CanvasRenderingContext2D,
    node1: MapNode,
    node2: MapNode,
    transportTypes: TransportType[]
  ) => {
    const [x1, y1] = node1.position;
    const [x2, y2] = node2.position;
    const scaledX1 = x1 * 100 + 400;
    const scaledY1 = y1 * 100 + 300;
    const scaledX2 = x2 * 100 + 400;
    const scaledY2 = y2 * 100 + 300;

    // Draw a line for each transport type
    transportTypes.forEach((type, index) => {
      const offset = (index - (transportTypes.length - 1) / 2) * 4;
      const angle = Math.atan2(scaledY2 - scaledY1, scaledX2 - scaledX1);
      const perpX = Math.sin(angle) * offset;
      const perpY = -Math.cos(angle) * offset;

      ctx.beginPath();
      ctx.moveTo(scaledX1 + perpX, scaledY1 + perpY);
      ctx.lineTo(scaledX2 + perpX, scaledY2 + perpY);
      ctx.strokeStyle = TRANSPORT_COLORS[type];
      ctx.lineWidth = CONNECTION_WIDTH;
      ctx.stroke();
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentPlayer || room.currentTurn !== currentPlayer.id) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked node
    const clickedNode = gameMap.nodes.find(node => {
      const [nodeX, nodeY] = node.position;
      const scaledX = nodeX * 100 + 400;
      const scaledY = nodeY * 100 + 300;
      const dx = x - scaledX;
      const dy = y - scaledY;
      return Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS;
    });

    if (clickedNode && validMoves.includes(clickedNode.id)) {
      // If it's a valid move, emit the move event
      const socket = (window as any).socket;
      if (socket) {
        const availableTransports = clickedNode.transportTypes.filter(
          type => currentPlayer.tickets[type] > 0
        );
        if (availableTransports.length > 0) {
          socket.emit('makeMove', {
            roomCode: room.code,
            nodeId: clickedNode.id,
            transportType: availableTransports[0]
          });
        }
      }
    }
  };

  // Draw the game board
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    gameMap.nodes.forEach(node => {
      node.connections.forEach(connId => {
        const targetNode = gameMap.nodes.find(n => n.id === connId);
        if (targetNode) {
          const commonTransports = node.transportTypes.filter(type =>
            targetNode.transportTypes.includes(type)
          );
          drawConnection(ctx, node, targetNode, commonTransports);
        }
      });
    });

    // Draw nodes
    gameMap.nodes.forEach(node => {
      drawNode(ctx, node);
    });
  }, [room, validMoves, hoveredNode]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        className="border border-gray-700 rounded-lg"
      />
      {currentPlayer && (
        <div className="absolute bottom-4 left-4 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-bold mb-2">Your Tickets:</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(currentPlayer.tickets).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between bg-gray-700 p-2 rounded"
              >
                <span className="capitalize">{type}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 