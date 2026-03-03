# Tibia-like Web Game

A browser-based MMORPG inspired by classic Tibia mechanics.

## Architecture

This is a monorepo with the following structure:

```
├── apps/
│   ├── client/     # React + PixiJS frontend
│   └── server/     # Node.js + TypeScript backend
└── shared/
    └── types/      # Shared TypeScript types
```

## Technology Stack

- **Frontend**: React 18, TypeScript, PixiJS, Vite
- **Backend**: Node.js, Express, TypeScript, Socket.io
- **Database**: PostgreSQL (persistent data) + Redis (caching)
- **Communication**: WebSockets for real-time gameplay

## Key Features

- Grid-based movement system
- Multi-level maps (Z-axis: -7 to +7)
- Field of View system (15x11 tiles)
- Real-time multiplayer synchronization
- Entity interpolation for smooth movement
- Viewport culling for performance

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis (optional, for caching)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Set up environment variables:
   ```bash
   cp apps/server/.env.example apps/server/.env
   # Edit apps/server/.env with your database credentials
   ```

4. Start development servers:
   ```bash
   npm run dev
   ```

This will start:
- Client server at http://localhost:3000
- Game server at http://localhost:3001

## Development

### Client Development
```bash
npm run dev:client
```

### Server Development
```bash
npm run dev:server
```

### Build for Production
```bash
npm run build
```

## Game Mechanics

### Grid System
- Movement is tile-based (no smooth movement between tiles)
- Server runs on tick system (100-200ms per tick)
- Client uses entity interpolation for visual smoothness

### Map System
- Multiple floor levels (-7 to +7)
- Each tile has properties: type, walkable status
- Field of View: players see only 15x11 tiles around them

### Real-time Features
- WebSocket communication for instant updates
- Authoritative server architecture
- Client is purely a visualizer of server state

## Contributing

1. Follow the existing code structure
2. Keep shared types in `/shared/types`
3. Maintain separation between client and server logic
4. Test multiplayer features thoroughly
