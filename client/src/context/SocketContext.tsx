import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Room } from '../types/game';

interface SocketContextType {
  socket: Socket | null;
  room: Room | null;
  error: string | null;
  setRoom: React.Dispatch<React.SetStateAction<Room | null>>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  room: null,
  error: null,
  setRoom: () => {}
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create socket connection
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true
    });

    // Handle connection
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setError(null);
    });

    // Handle disconnection
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setRoom(null);
    });

    // Handle room state updates
    newSocket.on('roomState', (updatedRoom: Room) => {
      console.log('Room state updated:', updatedRoom);
      setRoom(updatedRoom);
      setError(null);
    });

    // Handle errors
    newSocket.on('error', (message: string) => {
      console.error('Server error:', message);
      setError(message);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('roomState');
      newSocket.off('error');
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, room, error, setRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext; 