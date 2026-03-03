import React, { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import './App.css';

function App() {
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    if (playerName.trim()) {
      setGameStarted(true);
    }
  };

  if (gameStarted) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Tibia-like Web Game</h1>
          <p>Playing as: {playerName}</p>
        </header>
        <GameCanvas playerName={playerName} />
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
