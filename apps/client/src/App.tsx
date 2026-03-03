import React, { useState, useEffect, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { ChatOverlay } from './components/ChatOverlay';
import { InventoryPanel } from './components/InventoryPanel';
import './App.css';

// Define types locally to avoid shared types issues
export interface ChatMessagePayload {
  text: string;
  senderId: string;
  timestamp: number;
}

export interface InventorySlot {
  id: string;
  itemId: string;
  quantity: number;
  item: Item;
}

export interface Item {
  id: string;
  name: string;
  rarity: ItemRarity;
  description: string;
  value: number;
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface ItemDropPayload {
  slotId: string;
  position: { x: number; y: number; z: number };
}

function App() {
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [chatActive, setChatActive] = useState(false);
  const [chatMessages, setChatMessages] = useState<(ChatMessagePayload & { senderName: string })[]>([]);
  const [inventory, setInventory] = useState<InventorySlot[]>([]);
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

  const handleInventoryUpdate = (inventory: InventorySlot[]) => {
    setInventory(inventory);
  };

  const handleDropItem = (slot: InventorySlot) => {
    if (gameClientRef.current && slot.item) {
      const localPlayer = gameClientRef.current.getLocalPlayer();
      if (localPlayer) {
        const dropPayload: ItemDropPayload = {
          slotId: slot.id,
          position: localPlayer.position
        };
        gameClientRef.current.dropItem(dropPayload);
      }
    }
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
          onInventoryUpdate={handleInventoryUpdate}
          onGameClientReady={(client) => {
            gameClientRef.current = client;
            client.setChatMessageHandler(handleChatMessage);
            client.setInventoryHandler(handleInventoryUpdate);
          }}
        />
        <ChatOverlay
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          isActive={chatActive}
          onActivate={() => setChatActive(true)}
          onDeactivate={() => setChatActive(false)}
        />
        <InventoryPanel
          inventory={inventory}
          onDropItem={handleDropItem}
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
