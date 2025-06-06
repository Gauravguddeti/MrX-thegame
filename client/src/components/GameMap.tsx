import React, { useEffect, useRef, useState } from 'react';
import { Room, Player, TransportType } from '../types/game';
import { MAP_NODES } from '../config/map';

interface GameMapProps {
  room: Room;
  currentPlayer: Player | undefined;
  onNodeSelect: (nodeId: string) => void;
}

const MRX_PAWN = `data:image/svg+xml,${encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="90" rx="30" ry="8" fill="rgba(0,0,0,0.2)"/>
  <path d="M35 85 L65 85 L60 75 L40 75 Z" fill="#c41e3a"/>
  <path d="M40 75 L60 75 L55 45 L45 45 Z" fill="#c41e3a"/>
  <circle cx="50" cy="35" r="15" fill="#c41e3a"/>
  <path d="M35 35 L65 35 L60 30 L40 30 Z" fill="#1a1a1a"/>
  <path d="M40 30 L60 30 L50 15 Z" fill="#1a1a1a"/>
  <text x="50" y="42" font-family="Arial" font-size="20" fill="white" text-anchor="middle">?</text>
</svg>`)}`;

const DETECTIVE_PAWN = `data:image/svg+xml,${encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="90" rx="30" ry="8" fill="rgba(0,0,0,0.2)"/>
  <path d="M35 85 L65 85 L60 75 L40 75 Z" fill="#2196F3"/>
  <path d="M40 75 L60 75 L55 45 L45 45 Z" fill="#2196F3"/>
  <circle cx="50" cy="35" r="15" fill="#2196F3"/>
  <path d="M30 35 L70 35 L65 30 L35 30 Z" fill="#1a1a1a"/>
  <path d="M35 30 L65 30 L50 20 Z" fill="#1a1a1a"/>
  <circle cx="45" cy="40" r="5" fill="none" stroke="white" stroke-width="2"/>
  <line x1="48" y1="43" x2="55" y2="50" stroke="white" stroke-width="2"/>
</svg>`)}`;

const TRANSPORT_COLORS: Record<TransportType, string> = {
  rickshaw: '#FF9800', // Orange for rickshaw
  bus: '#4CAF50',     // Green for bus
  metro: '#2196F3',   // Blue for metro
  train: '#9C27B0'    // Purple for train
};

const NODE_COLORS = {
  normal: '#607D8B',
  start: '#4CAF50',
  escape: '#F44336',
  selected: '#FFC107',
  mrx: '#F44336',
  detective: '#2196F3',
  hover: '#FFC107'
};

const NODE_RADIUS = 12;
const MAP_WIDTH = 1200;
const MAP_HEIGHT = 800;
const LABEL_OFFSET = 20;
const PAWN_SIZE = 30;

export const GameMap: React.FC<GameMapProps> = ({ room, currentPlayer, onNodeSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);
  const [mrxPawnImage, setMrxPawnImage] = useState<HTMLImageElement | null>(null);
  const [detectivePawnImage, setDetectivePawnImage] = useState<HTMLImageElement | null>(null);

  // Load images
  useEffect(() => {
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    Promise.all([
      loadImage('/pune-map-bg.jpg'),
      loadImage(MRX_PAWN),
      loadImage(DETECTIVE_PAWN)
    ]).then(([mapImg, mrxImg, detectiveImg]) => {
      setMapImage(mapImg);
      setMrxPawnImage(mrxImg);
      setDetectivePawnImage(detectiveImg);
    });
  }, []);

  const isValidMove = (nodeId: string) => {
    if (!currentPlayer || room.currentTurn !== currentPlayer.id) return false;

    // If player hasn't placed their piece yet
    if (!currentPlayer.position) {
      const node = MAP_NODES.find(n => n.id === nodeId);
      if (!node) return false;
      
      // Check if the node is already occupied
      const isOccupied = room.players.some(p => p.position === nodeId);
      return !isOccupied && node.type === 'start';
    }

    // Check if the node is connected to current position
    const currentNode = MAP_NODES.find(n => n.id === currentPlayer.position);
    if (!currentNode) return false;

    const targetNode = MAP_NODES.find(n => n.id === nodeId);
    if (!targetNode) return false;

    // Check if there's a connection between the nodes
    const connection = currentNode.connections.find(conn => conn.to === nodeId);
    if (!connection) return false;

    // Check if player has required tickets
    return connection.transportTypes.some(type => currentPlayer.tickets[type] > 0);
  };

  const drawNode = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: string,
    isOccupied: boolean,
    isHovered: boolean,
    label: string,
    id: string
  ) => {
    // Draw node circle with shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);
    
    // Set node color based on type and state
    if (isHovered && isValidMove(id)) {
      ctx.fillStyle = NODE_COLORS.hover;
    } else if (isOccupied) {
      ctx.fillStyle = type === 'mrx' ? NODE_COLORS.mrx : NODE_COLORS.detective;
    } else {
      ctx.fillStyle = NODE_COLORS[type as keyof typeof NODE_COLORS] || NODE_COLORS.normal;
    }
    
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw node number with shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(id, x, y);
    ctx.restore();

    // Draw location name with shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.font = '12px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y + LABEL_OFFSET);
    ctx.restore();
  };

  const drawConnection = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    transportTypes: TransportType[]
  ) => {
    const spacing = 3;
    transportTypes.forEach((type, index) => {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = TRANSPORT_COLORS[type];
      ctx.lineWidth = 3;
      
      // Add glow effect
      ctx.shadowColor = TRANSPORT_COLORS[type];
      ctx.shadowBlur = 5;
      
      // Calculate offset for parallel lines
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const offset = (index - (transportTypes.length - 1) / 2) * spacing;
      const offsetX = Math.sin(angle) * offset;
      const offsetY = -Math.cos(angle) * offset;
      
      ctx.moveTo(x1 + offsetX, y1 + offsetY);
      ctx.lineTo(x2 + offsetX, y2 + offsetY);
      ctx.stroke();
      ctx.restore();
    });
  };

  const drawPawn = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    player: Player,
    showMrX: boolean
  ) => {
    if (!detectivePawnImage || !mrxPawnImage) return;

    const pawnImage = player.role === 'mrx' && !showMrX ? mrxPawnImage : detectivePawnImage;
    const pawnX = x - PAWN_SIZE / 2;
    const pawnY = y - PAWN_SIZE / 2;

    // Draw pawn shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.drawImage(pawnImage, pawnX, pawnY, PAWN_SIZE, PAWN_SIZE);
    ctx.restore();

    // Draw player name
    ctx.save();
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(player.name, x, y + PAWN_SIZE / 2 + 5);
    ctx.restore();
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = x * scaleX;
    const clickY = y * scaleY;

    // Find clicked node
    const clickedNode = MAP_NODES.find(node => {
      const dx = clickX - node.x;
      const dy = clickY - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS;
    });

    if (clickedNode && isValidMove(clickedNode.id)) {
      onNodeSelect?.(clickedNode.id);
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = x * scaleX;
    const mouseY = y * scaleY;

    // Find hovered node
    const hovered = MAP_NODES.find(node => {
      const dx = mouseX - node.x;
      const dy = mouseY - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS;
    });

    setHoveredNode(hovered?.id || null);
  };

  // Draw the game map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw map background with a slight blur for depth
    ctx.filter = 'blur(1px)';
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';

    // Draw connections first (so they appear under nodes)
    MAP_NODES.forEach(node => {
      node.connections.forEach(conn => {
        const targetNode = MAP_NODES.find(n => n.id === conn.to);
        if (targetNode) {
          drawConnection(
            ctx,
            node.x,
            node.y,
            targetNode.x,
            targetNode.y,
            conn.transportTypes
          );
        }
      });
    });

    // Draw nodes
    MAP_NODES.forEach(node => {
      const isOccupied = room.players.some(p => p.position === node.id);
      const isHovered = node.id === hoveredNode;
      drawNode(
        ctx,
        node.x,
        node.y,
        node.type,
        isOccupied,
        isHovered,
        node.label,
        node.id
      );
    });

    // Draw pawns last (so they appear on top)
    room.players.forEach(player => {
      if (player.position) {
        const node = MAP_NODES.find(n => n.id === player.position);
        if (node) {
          const showMrX = player.role === 'mrx' && (
            room.mrxLastKnownPosition === player.position ||
            [3, 8, 13].includes(room.turnNumber)
          );
          drawPawn(ctx, node.x, node.y, player, showMrX);
        }
      }
    });
  }, [room, hoveredNode, mapImage, mrxPawnImage, detectivePawnImage]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        className="w-full h-full object-contain"
      />
      {currentPlayer && (
        <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-90 p-4 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-2">Your Tickets:</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(currentPlayer.tickets).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between bg-gray-700 p-2 rounded"
              >
                <span className="text-white capitalize">{type}</span>
                <span className="font-bold text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameMap; 