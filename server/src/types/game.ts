export enum GameState {
  WAITING = 'WAITING',
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

export interface GameSettings {
  escapeRoutesUnlockTurn: number;
  turnTimeLimit: number;
  mrxRevealInterval: number;
  maxPlayers: number;
  startingTickets: {
    mrx: Record<TransportType, number>;
    detective: Record<TransportType, number>;
  };
}

export interface Player {
  id: string;
  name: string;
  role: 'mrx' | 'detective' | null;
  position: string | null;
  tickets: {
    [key in TransportType]: number;
  };
}

export interface Room {
  code: string;
  players: Player[];
  gameState: GameState;
  turnNumber: number;
  currentTurn: string;
  host: string;
  mrxLastKnownPosition: string | null;
  mrxLastKnownTurn: number | null;
  winner: 'mrx' | 'detectives' | null;
} 