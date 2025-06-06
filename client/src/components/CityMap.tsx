import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Room, Player } from '../types';

interface Node {
  id: number;
  x: number;
  y: number;
  name: string;
  connections: {
    to: number;
    type: 'rickshaw' | 'bus' | 'metro' | 'train';
  }[];
}

// Define the game nodes with their positions and connections based on the map
const gameNodes: Node[] = [
  // Major landmarks
  { id: 22, x: 400, y: 200, name: 'Shaniwar Wada', connections: [
    { to: 21, type: 'rickshaw' },
    { to: 23, type: 'bus' },
    { to: 31, type: 'metro' }
  ]},
  { id: 63, x: 850, y: 200, name: 'Aga Khan Palace', connections: [
    { to: 64, type: 'bus' },
    { to: 66, type: 'metro' },
    { to: 68, type: 'train' }
  ]},
  { id: 2, x: 150, y: 250, name: 'Sinhagad Fort', connections: [
    { to: 18, type: 'bus' },
    { to: 24, type: 'rickshaw' },
    { to: 26, type: 'bus' }
  ]},
  { id: 88, x: 100, y: 400, name: 'Deccan Gymkhana', connections: [
    { to: 18, type: 'metro' },
    { to: 24, type: 'bus' },
    { to: 68, type: 'rickshaw' }
  ]},
  // Water bodies and parks
  { id: 10, x: 300, y: 100, name: 'Pashan Lake', connections: [
    { to: 21, type: 'bus' },
    { to: 24, type: 'rickshaw' }
  ]},
  { id: 64, x: 650, y: 500, name: 'Rajiv Gandhi Zoo', connections: [
    { to: 66, type: 'metro' },
    { to: 68, type: 'bus' },
    { to: 94, type: 'train' }
  ]},
  // Transport hubs
  { id: 31, x: 500, y: 300, name: 'Central Area', connections: [
    { to: 23, type: 'bus' },
    { to: 24, type: 'metro' },
    { to: 37, type: 'train' },
    { to: 67, type: 'rickshaw' }
  ]},
  { id: 68, x: 750, y: 600, name: 'Magar Patta', connections: [
    { to: 64, type: 'bus' },
    { to: 66, type: 'metro' },
    { to: 94, type: 'rickshaw' }
  ]},
  // Residential areas
  { id: 38, x: 600, y: 200, name: 'Viman Nagar', connections: [
    { to: 44, type: 'bus' },
    { to: 62, type: 'metro' },
    { to: 67, type: 'rickshaw' }
  ]},
  { id: 23, x: 350, y: 350, name: 'Saras Baug', connections: [
    { to: 21, type: 'rickshaw' },
    { to: 24, type: 'bus' },
    { to: 28, type: 'metro' },
    { to: 38, type: 'train' }
  ]},
  // Additional nodes for gameplay balance
  { id: 21, x: 300, y: 300, name: 'City Center', connections: [
    { to: 23, type: 'rickshaw' },
    { to: 24, type: 'bus' },
    { to: 26, type: 'metro' }
  ]},
  { id: 24, x: 400, y: 400, name: 'Market Area', connections: [
    { to: 21, type: 'bus' },
    { to: 23, type: 'rickshaw' },
    { to: 28, type: 'metro' }
  ]},
  { id: 66, x: 700, y: 300, name: 'East Pune', connections: [
    { to: 64, type: 'metro' },
    { to: 67, type: 'bus' },
    { to: 68, type: 'train' }
  ]},
  { id: 94, x: 800, y: 400, name: 'South East', connections: [
    { to: 64, type: 'train' },
    { to: 66, type: 'metro' },
    { to: 68, type: 'bus' }
  ]},
  { id: 67, x: 650, y: 250, name: 'North East', connections: [
    { to: 31, type: 'rickshaw' },
    { to: 38, type: 'bus' },
    { to: 66, type: 'metro' }
  ]}
];

const transportColors = {
  rickshaw: '#ffa500', // Orange
  bus: '#4CAF50',     // Green
  metro: '#ff69b4',   // Pink
  train: '#4169e1'    // Blue
};

interface CityMapProps {
  room: Room;
  onNodeClick: (nodeId: string) => void;
  isMyTurn: boolean;
  currentPlayer: Player | null;
}

const CityMap: React.FC<CityMapProps> = ({
  room,
  onNodeClick,
  isMyTurn,
  currentPlayer
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);

  // Load the background map image
  useEffect(() => {
    const img = new Image();
    img.src = '/pune-map-bg.jpg';
    img.onload = () => setMapImage(img);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1000;
    canvas.height = 800;

    // Draw background map
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);

    // Draw connections
    gameNodes.forEach(node => {
      node.connections.forEach(conn => {
        const targetNode = gameNodes.find(n => n.id === conn.to);
        if (!targetNode) return;

        ctx.beginPath();
        ctx.strokeStyle = transportColors[conn.type];
        ctx.lineWidth = 3;
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.stroke();
      });
    });

    // Draw nodes
    gameNodes.forEach(node => {
      const isHovered = hoveredNode?.id === node.id;
      const playerAtNode = Object.entries(room.playerPositions).find(([_, pos]) => pos === node.id.toString());

      // Node circle
      ctx.beginPath();
      ctx.fillStyle = isHovered ? '#d4c5a8' : '#ffffff';
      ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node number
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.id.toString(), node.x, node.y + 4);

      // Node name
      ctx.font = '10px Arial';
      ctx.fillText(node.name, node.x, node.y + 25);

      // Player marker if any
      if (playerAtNode) {
        const [playerId] = playerAtNode;
        ctx.beginPath();
        ctx.fillStyle = playerId === currentPlayer?.id ? '#ff0000' : '#0000ff';
        ctx.arc(node.x, node.y - 20, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

  }, [room.playerPositions, currentPlayer, hoveredNode, mapImage]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMyTurn) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedNode = gameNodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 15;
    });

    if (clickedNode) {
      onNodeClick(clickedNode.id.toString());
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const nodeUnderMouse = gameNodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 15;
    });

    setHoveredNode(nodeUnderMouse || null);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        className="border border-gray-300 rounded-lg cursor-pointer"
        style={{ maxWidth: '100%', background: '#f5f3e8' }}
      />
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <h3 className="font-bold mb-2">Transport Types:</h3>
        {Object.entries(transportColors).map(([type, color]) => (
          <div key={type} className="flex items-center mb-1">
            <div
              className="w-8 h-2 mr-2"
              style={{ backgroundColor: color }}
            />
            <span className="capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CityMap; 