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
- **Deployment**: Docker + Docker Compose

## Key Features

- Grid-based movement system
- Multi-level maps (Z-axis: -7 to +7)
- Field of View system (15x11 tiles)
- Real-time multiplayer synchronization
- Entity interpolation for smooth movement
- Viewport culling for performance
- Tile-based collision system
- Docker containerization

## Getting Started

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start development servers:
   ```bash
   npm run dev
   ```

This will start:
- Client server at http://localhost:3000
- Game server at http://localhost:3001

### Docker Deployment

#### Local Docker

1. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

This will start:
- Client at http://localhost:80 (nginx)
- Server at http://localhost:3001

#### Production Deployment (Dokploy)

1. Push your code to GitHub repository
2. Connect your repository to Dokploy
3. Set environment variables in Dokploy:
   - `VITE_WS_URL=ws://your-domain.com:3001`
   - `NODE_ENV=production`
   - `PORT=3001`

4. Deploy using the Docker Compose configuration

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
- Server runs on tick system (10 ticks per second)
- Client uses entity interpolation for visual smoothness

### Map System
- Multiple floor levels (-7 to +7)
- Each tile has properties: type, walkable status
- Field of View: players see only 15x11 tiles around them
- Tile types: Grass, Wall, Water, Stone, Dirt, Sand

### Real-time Features
- WebSocket communication for instant updates
- Authoritative server architecture
- Client is purely a visualizer of server state

### Collision System
- Server-side validation of tile walkability
- Players cannot walk through walls or water
- Spawn system ensures players start on walkable tiles

## Docker Configuration

### Server Dockerfile
- Base: `node:20-slim`
- Copies shared types and server code
- Builds TypeScript
- Exposes port 3001

### Client Dockerfile
- Multi-stage build
- Stage 1: Node.js build environment
- Stage 2: nginx production server
- Exposes port 80

### Environment Variables
- `VITE_WS_URL`: WebSocket URL for client
- `NODE_ENV`: Production/development mode
- `PORT`: Server port

## Contributing

1. Follow the existing code structure
2. Keep shared types in `/shared/types`
3. Maintain separation between client and server logic
4. Test multiplayer features thoroughly
5. Use Docker for consistent development environment

## Future Enhancements

- PVP/PVE combat system
- Inventory and items
- Skills and leveling
- Guild system
- Chat system
- Database persistence
- Redis caching for performance
