import React from 'react';
import { TransportHub as TransportHubType } from '../types';
import * as THREE from 'three';

interface TransportHubProps {
  hub: TransportHubType;
  onClick?: () => void;
}

const hubScales = {
  train: [8, 4, 12],
  bus: [6, 3, 8],
  airport: [15, 2, 15],
};

const hubColors = {
  train: '#8B4513',
  bus: '#4A90E2',
  airport: '#808080',
};

export function TransportHub({ hub, onClick }: TransportHubProps) {
  const [width, height, depth] = hubScales[hub.type];
  const baseColor = hubColors[hub.type];

  return (
    <group
      position={[hub.position.x, height / 2, hub.position.z]}
      onClick={onClick}
    >
      {/* Base building */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={baseColor} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, height / 2 + 0.5, 0]} castShadow>
        <boxGeometry args={[width, 1, depth]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>

      {/* Type-specific details */}
      {hub.type === 'train' && (
        <>
          {/* Train tracks */}
          <mesh position={[0, -height / 2 + 0.1, 0]} receiveShadow>
            <boxGeometry args={[width * 1.5, 0.2, 2]} />
            <meshStandardMaterial color="#1C1C1C" />
          </mesh>
          {/* Platform */}
          <mesh position={[0, -height / 2 + 0.3, 3]} receiveShadow>
            <boxGeometry args={[width, 0.5, 2]} />
            <meshStandardMaterial color="#95A5A6" />
          </mesh>
        </>
      )}

      {hub.type === 'bus' && (
        <>
          {/* Bus stop sign */}
          <mesh position={[width / 2 - 1, height / 2, depth / 2]} castShadow>
            <boxGeometry args={[0.5, 4, 0.5]} />
            <meshStandardMaterial color="#E74C3C" />
          </mesh>
          {/* Shelter */}
          <mesh position={[0, 0, depth / 2 + 1]} castShadow>
            <boxGeometry args={[4, 3, 0.2]} />
            <meshStandardMaterial color="#BDC3C7" transparent opacity={0.6} />
          </mesh>
        </>
      )}

      {hub.type === 'airport' && (
        <>
          {/* Control tower */}
          <mesh position={[width / 4, height + 4, depth / 4]} castShadow>
            <cylinderGeometry args={[1.5, 2, 8, 8]} />
            <meshStandardMaterial color="#ECF0F1" />
          </mesh>
          {/* Runway */}
          <mesh position={[0, -height / 2 + 0.1, 0]} receiveShadow>
            <boxGeometry args={[width * 2, 0.2, depth / 3]} />
            <meshStandardMaterial color="#1C1C1C" />
          </mesh>
        </>
      )}

      {/* Unlock status indicator */}
      {hub.isUnlocked && (
        <mesh position={[0, height + 2, 0]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={getStatusColor(hub.type)} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

function getStatusColor(type: TransportHubType['type']): string {
  switch (type) {
    case 'train':
      return '#ff0000';
    case 'bus':
      return '#00ff00';
    case 'airport':
      return '#0000ff';
    default:
      return '#ffffff';
  }
} 