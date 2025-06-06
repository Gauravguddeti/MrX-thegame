import { Server, Socket } from 'socket.io';
import { Room, GameSettings, TransportType } from './types';

interface GameSocket extends Socket {
  join: (room: string) => void;
}

interface CreateRoomData {
  name: string;
  settings?: Partial<GameSettings>;
}

interface JoinRoomData {
  code: string;
  playerName: string;
}

interface StartGameData {
  roomCode: string;
}

interface MakeMoveData {
  roomCode: string;
  nodeId: string;
  transportType: TransportType;
}

interface UpdateSettingsData {
  roomCode: string;
  settings: Partial<GameSettings>;
}

interface ServerToClientEvents {
  gameStateUpdated: (room: Room) => void;
  playerJoined: (room: Room) => void;
  roomCreated: (room: Room) => void;
  gameEnded: (room: Room) => void;
  turnTimerUpdate: (timeLeft: number) => void;
  error: (message: string) => void;
}

export class GameServer {
  private io: Server<any, ServerToClientEvents>;

  constructor(httpServer: any, options: any) {
    this.io = new Server<any, ServerToClientEvents>(httpServer, options);
  }

  public on(event: 'connection', listener: (socket: GameSocket) => void): void {
    this.io.on(event, (socket) => listener(socket as GameSocket));
  }

  public emitToRoom(roomCode: string, event: keyof ServerToClientEvents, data: any): void {
    this.io.to(roomCode).emit(event, data);
  }

  public emitToSocket(socketId: string, event: keyof ServerToClientEvents, data: any): void {
    this.io.to(socketId).emit(event, data);
  }

  public getSocketById(socketId: string): GameSocket | undefined {
    return this.io.sockets.sockets.get(socketId) as GameSocket | undefined;
  }
} 