import React, { useEffect, useRef } from 'react';
import { GameClient } from '../game/GameClient';
import { ChatMessagePayload } from '../../../shared/types';

interface GameCanvasProps {
  playerName: string;
  onChatMessage: (message: ChatMessagePayload & { senderName: string }) => void;
  onGameClientReady: (client: GameClient) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ playerName, onChatMessage, onGameClientReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameClientRef = useRef<GameClient | null>(null);

  useEffect(() => {
    if (canvasRef.current && !gameClientRef.current) {
      gameClientRef.current = new GameClient(canvasRef.current, playerName);
      gameClientRef.current.setChatMessageHandler(onChatMessage);
      onGameClientReady(gameClientRef.current);
    }

    return () => {
      if (gameClientRef.current) {
        gameClientRef.current.destroy();
        gameClientRef.current = null;
      }
    };
  }, [playerName, onChatMessage, onGameClientReady]);

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        style={{
          border: '2px solid #444',
          imageRendering: 'pixelated',
        }}
      />
      <div className="controls-info">
        <p>Use WASD or Arrow keys to move</p>
        <p>Press Enter to open chat</p>
        <p>Green square = You, Red squares = Other players</p>
      </div>
    </div>
  );
};
