# C64 Game of the Day

A web application that lets you play a different Commodore 64 game every day.

## Features

- Play C64 games directly in your browser
- Responsive design that works on desktop and mobile
- Touch controls with virtual joystick
- Keyboard support for desktop users
- Clean, modern UI with dark theme

## Prerequisites

- Node.js 16.8 or later
- npm or yarn

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/c64gotd.git
   cd c64gotd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add game ROMs**
   Place your C64 game ROMs in the `public/games` directory.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Visit `http://localhost:3000` to see the app in action.

## Project Structure

- `src/app/` - Next.js app directory with page and layout components
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions and emulator integration
- `public/` - Static files including game ROMs and emulator files

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
- [Next.js](https://nextjs.org/) - The React Framework for Production
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS) - A JavaScript emulation platform
