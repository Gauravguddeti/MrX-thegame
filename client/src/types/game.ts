export enum GameState {
  WAITING = 'WAITING',
  MRX_SELECTION = 'MRX_SELECTION',
  MRX_PLACEMENT = 'MRX_PLACEMENT',
  DETECTIVE_PLACEMENT = 'DETECTIVE_PLACEMENT',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED'
}

export type TransportType = 'rickshaw' | 'bus' | 'metro' | 'train';

export type NodeType = 'normal' | 'start' | 'escape';

export interface Connection {
  to: string;
  transportTypes: TransportType[];
}

export interface MapNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  connections: Connection[];
}

export interface GameMap {
  nodes: MapNode[];
}

export interface GameSettings {
  escapeRoutesUnlockTurn: number;
  turnTimeLimit: number;
  mrxRevealInterval: number;
  maxPlayers: number;
  startingTickets: {
    [key in TransportType]: number;
  };
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  role: 'mrx' | 'detective' | null;
  position: string | null;
  tickets: Record<TransportType, number>;
  color: string;
}

export interface Move {
  playerId: string;
  position: string;
  transportType: TransportType;
  turn: number;
}

export interface Room {
  id: string;
  code: string;
  host: string;
  players: Player[];
  gameState: GameState;
  currentTurn: string | null;
  turnNumber: number;
  mrxLastKnownPosition: string | null;
  mrxLastKnownTurn: number | null;
  winner: 'mrx' | 'detectives' | 'disconnected' | null;
  settings: GameSettings;
  playerPositions: Record<string, string>;
} 