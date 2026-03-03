import React, { useState, useEffect, useRef } from 'react';
import { ChatMessagePayload } from '../App';

interface ChatMessage extends ChatMessagePayload {
  senderName: string;
}

interface ChatOverlayProps {
  onSendMessage: (message: string) => void;
  messages: ChatMessage[];
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({
  onSendMessage,
  messages,
  isActive,
  onActivate,
  onDeactivate
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      onDeactivate(); // Return focus to game
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onDeactivate();
    }
  };

  if (!isActive) {
    return (
      <div 
        className="chat-hint"
        onClick={onActivate}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer',
          border: '1px solid #444',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        Press Enter to chat
      </div>
    );
  }

  return (
    <div
      className="chat-overlay"
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        width: '300px',
        height: '200px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid #444',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px'
      }}
    >
      {/* Messages area */}
      <div
        className="chat-messages"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
          color: 'white',
          wordWrap: 'break-word'
        }}
      >
        {messages.map((message, index) => (
          <div key={`${message.timestamp}-${index}`} style={{ marginBottom: '4px' }}>
            <span style={{ color: '#ffd700', fontWeight: 'bold' }}>
              {message.senderName}:
            </span>{' '}
            <span style={{ color: '#ffffff' }}>
              {message.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} style={{ padding: '8px', borderTop: '1px solid #444' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type message..."
          maxLength={100}
          autoFocus
          style={{
            width: '100%',
            padding: '4px',
            border: '1px solid #666',
            borderRadius: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontSize: '12px',
            outline: 'none'
          }}
        />
      </form>
    </div>
  );
};
