'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { JoystickDirection } from '@/components/Joystick/Joystick';
import dynamic from 'next/dynamic';

// Dynamically import the Joystick component with SSR disabled
const Joystick = dynamic(
  () => import('@/components/Joystick/Joystick'),
  { ssr: false }
);

export default function Home() {
  // Canvas ref for potential future use
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Joystick handlers
  const handleJoystickMove = useCallback((direction: string) => {
    // Map joystick directions to keyboard events
    let key = '';
    switch (direction) {
      case 'UP': key = 'ArrowUp'; break;
      case 'RIGHT': key = 'ArrowRight'; break;
      case 'DOWN': key = 'ArrowDown'; break;
      case 'LEFT': key = 'ArrowLeft'; break;
      case 'BUTTON': key = ' '; break; // Space for fire button
      default: return;
    }
    
    // Dispatch keyboard event
    const event = new KeyboardEvent('keydown', { key, code: key });
    window.dispatchEvent(event);
  }, []);

  const handleJoystickStop = useCallback(() => {
    // Dispatch keyup for all possible joystick keys
    ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', ' '].forEach(key => {
      const event = new KeyboardEvent('keyup', { key, code: key });
      window.dispatchEvent(event);
    });
  }, []);

  // Memoize the joystick component to prevent re-renders
  const JoystickComponent = useMemo(() => {
    // Cast the direction to JoystickDirection type to satisfy TypeScript
    const handleMove = (direction: JoystickDirection) => {
      if (direction) { // Only call if direction is not null
        handleJoystickMove(direction);
      } else {
        handleJoystickStop();
      }
    };
    
    return <Joystick onMove={handleMove} onStop={handleJoystickStop} />;
  }, [handleJoystickMove, handleJoystickStop]);

  // Utility to load a script dynamically
  const loadScript = (src: string, callback?: () => void) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      if (callback) callback();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback || null;
    document.body.appendChild(script);
  };

  // Handle emulator errors
  useEffect(() => {
    const handleEmulatorError = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { message, error } = customEvent.detail || {};
      const errorMessage = error || message || 'An unknown error occurred while loading the game';
      console.error('Emulator error:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
      setIsGameStarted(false);
    };

    // Add event listener for emulator errors
    window.addEventListener('emulatorError', handleEmulatorError as EventListener);

    // Clean up event listener
    return () => {
      window.removeEventListener('emulatorError', handleEmulatorError as EventListener);
    };
  }, []);

  // Start the game
  const handleStartGame = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setIsGameStarted(false);

    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setLoadingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        // Load the emulator loader script and start the game
        loadScript('/emulator/vice.js', () => {
          // The emulator will handle setting isGameStarted via events
          // or we'll get an error event if something goes wrong
        });
      }
    }, 100);

    // Clean up interval if component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-darker-bg py-8">
      <div className="text-center">
        <h1 className="text-center text-4xl font-bold text-neon-yellow uppercase tracking-wider">
          C64 GAME OF THE DAY
        </h1>
      </div>
      
      <div className="max-w-4xl mx-auto px-4">
        <div 
          data-testid="game-area"
          id="game-area"
          className="relative w-full aspect-[4/3] min-h-[600px] min-w-[800px] bg-black/50 rounded-lg overflow-hidden border border-neon-yellow/30"
          style={{ position: 'relative', minHeight: '600px' }}
        >
          {/* The emulator will be injected here by vice.js */}
          <div id="emulator-container" className="absolute inset-0 w-full h-full" />
          
          {/* Keep the canvas for any overlay UI elements */}
          <canvas
            ref={canvasRef}
            id="game-canvas"
            className="absolute inset-0 w-full h-full pointer-events-none"
            width={800}
            height={600}
            style={{ zIndex: 1 }}
          />
          
          {isGameStarted && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-xl font-mono">
                BLOCKHEADS
              </div>
            </div>
          )}
          
          // removed overlay from game-area


          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-neon-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-bold text-neon-yellow mb-2">Loading System</h3>
                <p className="text-gray-300">
                  Initializing: <span className="text-neon-yellow font-mono">{loadingProgress}%</span>
                </p>
                <div className="w-48 h-1.5 bg-gray-800 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-neon-yellow transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-6 z-50">
              <div className="text-center p-8 bg-red-900/80 rounded-lg max-w-md border border-red-600/50">
                <h3 className="text-2xl font-bold text-red-400 mb-4">System Error</h3>
                <p className="text-red-200 mb-6">{error}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleStartGame}
                    className="px-6 py-3 bg-red-600 text-white font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      setError(null);
                      setIsLoading(false);
                    }}
                    className="px-6 py-3 bg-gray-600 text-white font-medium rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
                <div className="mt-4 text-xs text-red-300 text-left bg-black/30 p-2 rounded overflow-auto max-h-24">
                  <div className="font-mono text-xs">
                    {error.includes('http') ? (
                      <a 
                        href={error.split(' ').find(part => part.startsWith('http'))} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-300 hover:underline break-all"
                      >
                        {error}
                      </a>
                    ) : (
                      error
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div> {/* end game-area */}

        {isGameStarted && (
  <div className="md:hidden mt-8 p-6 bg-black/30 rounded-lg border border-neon-yellow/20 z-10">
          <h3 className="text-neon-yellow text-lg font-bold mb-4 text-center uppercase tracking-wider">
            On-Screen Controls
          </h3>
          <p className="text-gray-300 mb-4 text-center">
            Use the virtual joystick or keyboard controls to play
          </p>
          <div className="flex justify-center">
            {JoystickComponent}
          </div>
        </div>
)}

        <div className="mt-8 text-center">
          <div className="inline-flex flex-col items-center p-6 bg-black/40 rounded-lg border border-neon-yellow/20">
            <h3 className="text-neon-yellow text-lg font-bold mb-2 uppercase tracking-wider">
              TODAY'S FEATURE
            </h3>
            <p className="text-2xl font-black text-white mb-2">
              BLOCKHEADS
            </p>
            <p className="text-gray-300 text-sm mb-4">
              CLASSIC C64 ACTION • 1983 • MASTERTRONIC
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <span className="px-3 py-1 bg-amber-900/40 text-amber-200 text-xs rounded-full">
                ARCADE
              </span>
              <span className="px-3 py-1 bg-blue-900/40 text-blue-200 text-xs rounded-full">
                1-2 PLAYERS
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-xs text-gray-500 flex flex-wrap justify-center gap-4">
          <span>↑↓←→ TO MOVE</span>
          <span>SPACE TO FIRE</span>
          <span>ENTER TO START</span>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center">
          <button
            onClick={handleStartGame}
            disabled={isLoading}
            className="px-6 py-3 bg-red-700 border-4 border-yellow-300 text-white font-bold rounded text-shadow-lg hover:bg-red-500 focus:outline-none focus:ring-4 focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase text-lg z-50"
          >
            {isLoading ? 'Initializing...' : 'Start Game'}
          </button>
        </div>
      </div>
    </div>
  );
}
