import { Server as SocketIOServer, Socket } from 'socket.io';

export enum GameState {
  LOBBY = 'LOBBY',
  MRX_SELECTION = 'MRX_SELECTION',
  MRX_PLACEMENT = 'MRX_PLACEMENT',
  DETECTIVE_PLACEMENT = 'DETECTIVE_PLACEMENT',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export type PlayerRole = 'mrx' | 'detective' | null;

export type TransportType = 'rickshaw' | 'bus' | 'metro' | 'train';
export type NodeType = 'normal' | 'start' | 'escape';

export interface MapNode {
  id: string;
  type: NodeType;
  name: string;
  position: [number, number];
  transportTypes: TransportType[];
  connections: string[];
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
  role: PlayerRole;
  position: string | null;
  tickets: {
    [key in TransportType]: number;
  };
  ready: boolean;
}

export interface Move {
  playerId: string;
  position: string;
  transportType: TransportType;
  turn: number;
}

export interface Room {
  code: string;
  host: string;
  players: Player[];
  gameState: GameState;
  currentTurn: string | null;
  mrxLastKnownPosition: string | null;
  mrxLastKnownTurn: number | null;
  winner: 'mrx' | 'detectives' | 'disconnected' | null;
  settings: GameSettings;
  playerPositions: { [key: string]: string };
  turnNumber: number;
  moveHistory: Move[];
}

export const gameMap: { nodes: MapNode[] } = {
  nodes: [] // This will be populated with actual map data
};

export interface ServerToClientEvents {
  gameStateUpdated: (room: Room) => void;
  playerJoined: (room: Room) => void;
  roomCreated: (room: Room) => void;
  gameEnded: (room: Room) => void;
  turnTimerUpdate: (timeLeft: number) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  createRoom: (data: { name: string; settings?: Partial<GameSettings> }) => void;
  joinRoom: (data: { code: string; playerName: string }) => void;
  leaveRoom: (data: { code: string }) => void;
  startGame: (data: { roomCode: string }) => void;
  makeMove: (data: { roomCode: string; nodeId: string; transportType: TransportType }) => void;
  updateSettings: (data: { roomCode: string; settings: Partial<GameSettings> }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  roomCode?: string;
}

export type TypedServer = SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export interface SocketIOEvents {
  emit: {
    (ev: 'gameStateUpdated', room: Room): void;
    (ev: 'playerJoined', room: Room): void;
    (ev: 'roomCreated', room: Room): void;
    (ev: 'gameEnded', room: Room): void;
    (ev: 'turnTimerUpdate', timeLeft: number): void;
    (ev: 'error', message: string): void;
  };
  on: {
    (ev: 'createRoom', callback: (data: { name: string; settings?: Partial<GameSettings> }) => void): void;
    (ev: 'joinRoom', callback: (data: { code: string; playerName: string }) => void): void;
    (ev: 'leaveRoom', callback: (data: { code: string }) => void): void;
    (ev: 'startGame', callback: (data: { roomCode: string }) => void): void;
    (ev: 'makeMove', callback: (data: { roomCode: string; nodeId: string; transportType: TransportType }) => void): void;
    (ev: 'updateSettings', callback: (data: { roomCode: string; settings: Partial<GameSettings> }) => void): void;
  };
} 