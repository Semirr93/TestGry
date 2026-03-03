import React, { useState, useEffect, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { ChatOverlay } from './components/ChatOverlay';
import { ChatMessagePayload } from '../../../shared/types';
import './App.css';

function App() {
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [chatActive, setChatActive] = useState(false);
  const [chatMessages, setChatMessages] = useState<(ChatMessagePayload & { senderName: string })[]>([]);
  const gameClientRef = useRef<any>(null);

  const handleStartGame = () => {
    if (playerName.trim()) {
      setGameStarted(true);
    }
  };

  const handleSendMessage = (message: string) => {
    if (gameClientRef.current) {
      gameClientRef.current.sendMessage(message);
    }
  };

  const handleChatMessage = (message: ChatMessagePayload & { senderName: string }) => {
    setChatMessages(prev => [...prev.slice(-50), message]); // Keep last 50 messages
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !chatActive && gameStarted) {
        e.preventDefault();
        setChatActive(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chatActive, gameStarted]);

  if (gameStarted) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Tibia-like Web Game</h1>
          <p>Playing as: {playerName}</p>
        </header>
        <GameCanvas 
          playerName={playerName} 
          onChatMessage={handleChatMessage}
          onGameClientReady={(client) => {
            gameClientRef.current = client;
            client.setChatMessageHandler(handleChatMessage);
          }}
        />
        <ChatOverlay
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          isActive={chatActive}
          onActivate={() => setChatActive(true)}
          onDeactivate={() => setChatActive(false)}
        />
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Tibia-like Web Game</h1>
        <div className="login-form">
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
            maxLength={20}
          />
          <button onClick={handleStartGame} disabled={!playerName.trim()}>
            Start Game
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
