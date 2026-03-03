import React, { useEffect, useRef } from 'react';
import { GameClient } from '../game/GameClient';

interface GameCanvasProps {
  playerName: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ playerName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameClientRef = useRef<GameClient | null>(null);

  useEffect(() => {
    if (canvasRef.current && !gameClientRef.current) {
      gameClientRef.current = new GameClient(canvasRef.current, playerName);
    }

    return () => {
      if (gameClientRef.current) {
        gameClientRef.current.destroy();
        gameClientRef.current = null;
      }
    };
  }, [playerName]);

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
        <p>Green square = You, Red squares = Other players</p>
      </div>
    </div>
  );
};
