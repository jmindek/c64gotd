# C64 Game of the Day

A web application that lets you play a different Commodore 64 game every day.

## Features

- Play C64 games directly in your browser
- Responsive design that works on desktop and mobile (mobile to be verified)
- Touch controls with virtual joystick (to be verified)
- Keyboard support for desktop users
- Clean, modern UI with dark theme

## Prerequisites

- Node.js 16.8 or later
- npm or yarn
- Docker and Docker Compose (optional)

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/c64gotd.git
cd c64gotd
```

### 2. Add game ROMs
Place your C64 game ROMs in the `public/games` directory.

---

## Running Locally (Frontend & Backend)

### Install frontend dependencies
```bash
npm install
```

### Start the frontend (Vite)
```bash
npm run dev
```

- Open your browser at [http://localhost:3000](http://localhost:3000)

### Start the backend (FastAPI)
```bash
cd backend
uv pip install -r pyproject.toml
uvicorn main:app --reload
```

- Backend runs at [http://localhost:8000](http://localhost:8000)

---

## Running with Docker Compose

This project is set up for easy containerized development and deployment.

### Build and start all services
```bash
// Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
// Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000)

### Stop all services
```bash
docker-compose down
```

---

## Architecture
- **Frontend:** Vite (TypeScript), served via Nginx in production container
- **Backend:** FastAPI (Python 3.13, Pydantic, SQLite, uvicorn)
- **Development:** Hot reload for both frontend and backend
- **Production:** Use Docker Compose for full stack

---

## Testing

### Frontend
```bash
npm run test
```

### Backend
```bash
cd backend
uv pip install pytest
pytest
```

---

## Adding Games

1. Place your C64 game ROMs (`.prg`, `.d64`, etc.) in the `public/games` directory.
2. Update the game list in `src/lib/games.ts` with the game details.

## Keyboard Controls

- Arrow Keys: Move
- Left Ctrl / Right Ctrl: Fire button
- Space: Jump/Secondary action
- Enter: Start game
- Escape: Pause/Open menu

## Mobile Controls

- Touch the screen to show the virtual joystick
- Move your finger around the joystick to move
- Tap the fire button to shoot

## Building for Production

```bash
npm run build
npm start
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [VICE](https://vice-emu.sourceforge.io/) - The Versatile Commodore Emulator
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS) - A JavaScript emulation platform
