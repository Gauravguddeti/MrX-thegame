import { Room, Player, GameState, TransportType } from './types/game';

const INITIAL_TICKETS = {
  mrx: {
    rickshaw: 4,
    bus: 3,
    metro: 3,
    train: 2
  },
  detective: {
    rickshaw: 10,
    bus: 8,
    metro: 4,
    train: 3
  }
};

const MRX_REVEAL_TURNS = [3, 8, 13]; // Mr. X's location is revealed on these turns

export class GameManager {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId: string): Room {
    const room: Room = {
      code: roomId,
      players: [],
      gameState: GameState.WAITING,
      turnNumber: 0,
      currentTurn: '',
      host: '',
      mrxLastKnownPosition: null,
      mrxLastKnownTurn: null,
      winner: null
    };
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  addPlayer(roomId: string, playerId: string, playerName: string): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    // Check if player is already in the room
    if (room.players.some(p => p.id === playerId)) {
      return room;
    }

    // Check if room is full
    if (room.players.length >= 6) {
      return undefined;
    }

    // Check if game is in progress
    if (room.gameState !== GameState.WAITING) {
      return undefined;
    }

    // First player becomes host
    if (room.players.length === 0) {
      room.host = playerId;
    }

    // Create new player with null role initially
    const player: Player = {
      id: playerId,
      name: playerName,
      role: null,
      position: null,
      tickets: {
        rickshaw: 10,
        bus: 8,
        metro: 4,
        train: 3
      }
    };

    room.players.push(player);
    return room;
  }

  removePlayer(roomId: string, playerId: string): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    room.players = room.players.filter(p => p.id !== playerId);

    // If room is empty, delete it
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return undefined;
    }

    // If host left, assign new host
    if (room.host === playerId && room.players.length > 0) {
      room.host = room.players[0].id;
    }

    return room;
  }

  startGame(roomId: string): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    // Need at least 2 players to start
    if (room.players.length < 2) {
      return undefined;
    }

    // Randomly select one player to be Mr. X
    const mrxIndex = Math.floor(Math.random() * room.players.length);
    room.players.forEach((player, index) => {
      if (index === mrxIndex) {
        player.role = 'mrx';
        // Set Mr. X's tickets
        player.tickets = {
          rickshaw: INITIAL_TICKETS.mrx.rickshaw,
          bus: INITIAL_TICKETS.mrx.bus,
          metro: INITIAL_TICKETS.mrx.metro,
          train: INITIAL_TICKETS.mrx.train
        };
      } else {
        player.role = 'detective';
        // Set detective's tickets
        player.tickets = {
          rickshaw: INITIAL_TICKETS.detective.rickshaw,
          bus: INITIAL_TICKETS.detective.bus,
          metro: INITIAL_TICKETS.detective.metro,
          train: INITIAL_TICKETS.detective.train
        };
      }
    });

    room.gameState = GameState.MRX_PLACEMENT;
    room.turnNumber = 1;
    room.currentTurn = room.players.find(p => p.role === 'mrx')?.id || '';

    return room;
  }

  placePlayer(roomId: string, playerId: string, nodeId: string): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return undefined;

    // Check if it's player's turn
    if (room.currentTurn !== playerId) return undefined;

    // Place player
    player.position = nodeId;

    // Update game state
    if (room.gameState === GameState.MRX_PLACEMENT) {
      room.gameState = GameState.DETECTIVE_PLACEMENT;
      room.currentTurn = room.players.find(p => p.role === 'detective' && !p.position)?.id || '';
    } else if (room.gameState === GameState.DETECTIVE_PLACEMENT) {
      // Check if all detectives are placed
      const unplacedDetective = room.players.find(p => p.role === 'detective' && !p.position);
      if (unplacedDetective) {
        room.currentTurn = unplacedDetective.id;
      } else {
        room.gameState = GameState.IN_PROGRESS;
        room.currentTurn = room.players.find(p => p.role === 'mrx')?.id || '';
      }
    }

    return room;
  }

  movePlayer(roomId: string, playerId: string, nodeId: string, transportType: TransportType): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return undefined;

    // Check if it's player's turn
    if (room.currentTurn !== playerId) return undefined;

    // Check if player has enough tickets
    if (player.tickets[transportType] <= 0) return undefined;

    // Move player
    player.position = nodeId;
    player.tickets[transportType]--;

    // Update Mr. X's last known position on reveal turns
    if (player.role === 'mrx' && [3, 8, 13].includes(room.turnNumber)) {
      room.mrxLastKnownPosition = nodeId;
      room.mrxLastKnownTurn = room.turnNumber;
    }

    // Update turn
    if (player.role === 'mrx') {
      // Find first detective without a move
      room.currentTurn = room.players.find(p => p.role === 'detective')?.id || '';
    } else {
      // Find next detective or go back to Mr. X
      const currentPlayerIndex = room.players.findIndex(p => p.id === playerId);
      const nextPlayer = room.players
        .slice(currentPlayerIndex + 1)
        .find(p => p.role === 'detective');

      if (nextPlayer) {
        room.currentTurn = nextPlayer.id;
      } else {
        // All detectives have moved, next turn
        room.turnNumber++;
        room.currentTurn = room.players.find(p => p.role === 'mrx')?.id || '';

        // Check win conditions
        if (room.turnNumber > 15) {
          room.gameState = GameState.FINISHED;
          room.winner = 'mrx';
        }
      }
    }

    // Check if Mr. X is caught
    const mrx = room.players.find(p => p.role === 'mrx');
    if (mrx && room.players.some(p => p.role === 'detective' && p.position === mrx.position)) {
      room.gameState = GameState.FINISHED;
      room.winner = 'detectives';
    }

    // Check if detectives are out of tickets
    const detectives = room.players.filter(p => p.role === 'detective');
    const noTickets = detectives.every(d => 
      Object.values(d.tickets).every(count => count === 0)
    );
    if (noTickets) {
      room.gameState = GameState.FINISHED;
      room.winner = 'mrx';
    }

    return room;
  }
} 