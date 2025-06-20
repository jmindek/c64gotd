'use client';

import { useState, useEffect, useRef } from 'react';
import { GameManager } from '../utils/gameManager';

type GameData = {
  name: string;
  year?: number;
  publisher?: string;
  genre?: string;
  players?: string;
  description?: string;
  d64Path?: string;
  thumbnailPath?: string;
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameData, setGameData] = useState<GameData>({
    name: 'Loading...',
    year: 1983,
    publisher: 'COMMODORE',
    genre: 'ARCADE',
    players: '1-2 PLAYERS',
    description: 'A classic Commodore 64 game.'
  });

  // Load game data
  useEffect(() => {
    const loadGame = async () => {
      console.log('Loading game data...');
      try {
        const { GameManager } = await import('@/utils/gameManager');
        console.log('Fetching today\'s game...');
        const todaysGame = await GameManager.getTodaysGame();
        console.log('Today\'s game:', todaysGame);
        
        if (todaysGame) {
          const updatedGameData: GameData = {
            name: todaysGame.name.toUpperCase(),
            d64Path: todaysGame.d64Path,
            thumbnailPath: todaysGame.thumbnailPath,
            description: todaysGame.description || 'A classic Commodore 64 game.',
            year: typeof todaysGame.year === 'number' ? todaysGame.year : 1983,
            publisher: todaysGame.publisher || 'UNKNOWN',
            genre: todaysGame.genre || 'ARCADE',
            players: todaysGame.players || '1-2 PLAYERS'
          };
          
          console.log('Setting game data:', updatedGameData);
          setGameData(updatedGameData);
          
          // Preload the game thumbnail
          if (updatedGameData.thumbnailPath) {
            const img = new Image();
            img.src = updatedGameData.thumbnailPath;
          }
        } else {
          console.warn('No game found for today');
          setGameData(prev => ({
            ...prev,
            name: 'NO GAME',
            description: 'No game available for today. Please try again later.'
          }));
        }
      } catch (error) {
        console.error('Error loading game:', error);
        setGameData({
          name: 'ERROR',
          description: 'Failed to load game data. Please refresh the page to try again.',
          year: 1983,
          publisher: 'ERROR',
          genre: 'ERROR',
          players: '0'
        });
      }
    };

    loadGame();
  }, []);

  const handleStartGame = async () => {
    console.log('Start game clicked');
    console.log('Game data:', gameData);
    
    if (!gameData.d64Path) {
      const errorMsg = 'No game path available';
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Force a small delay to ensure the UI updates before loading the emulator
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Starting game:', gameData.name, 'Path:', gameData.d64Path);
      const success = await GameManager.initializeEmulator(gameData.d64Path);
      
      if (success) {
        console.log('Game started successfully');
        setIsGameStarted(true);
      } else {
        const errorMsg = 'Failed to initialize emulator';
        console.error(errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Error starting game:', error);
      setError('An error occurred while loading the game.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up emulator on unmount
  useEffect(() => {
    return () => {
      // Import and stop emulator when component unmounts
      import('@/utils/gameManager').then(({ GameManager }) => {
        GameManager.stopEmulator();
      });
    };
  }, []);

  // Create a ref for the emulator container
  const emulatorContainerRef = useRef<HTMLDivElement>(null);

  // Handle emulator initialization when game starts
  useEffect(() => {
    let isMounted = true;

    const initEmulator = async () => {
      if (isGameStarted && gameData?.d64Path) {
        try {
          await GameManager.initializeEmulator(gameData.d64Path);
          if (isMounted) {
            // Force a re-render to ensure the canvas is properly attached
            setIsGameStarted(true);
          }
        } catch (error) {
          console.error('Error initializing emulator:', error);
          if (isMounted) {
            setError('Failed to load the game. Please try again.');
            setIsGameStarted(false);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }
    };

    initEmulator();

    return () => {
      isMounted = false;
      // Clean up the emulator when the component unmounts or game changes
      GameManager.stopEmulator();
    };
  }, [isGameStarted, gameData]);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 uppercase tracking-wider">
            C64 GAME OF THE DAY
          </h1>
          
          {/* Start Game Button */}
          <button
            onClick={handleStartGame}
            disabled={isLoading}
            className={`mt-6 px-8 py-3 bg-yellow-400 text-black font-bold rounded-lg text-lg
                      hover:bg-yellow-300 active:scale-95 transition-all shadow-lg
                      focus:outline-none focus:ring-4 focus:ring-yellow-400/50
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                LOADING...
              </span>
            ) : 'START GAME'}
          </button>
        </div>
        
        {/* Game Area */}
        <div id="game-container" className="relative w-full aspect-[4/3] bg-black/90 rounded-lg overflow-hidden mb-8 border border-yellow-400/30">
          {/* Start Screen Overlay */}
          {!isGameStarted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/80 z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-6 uppercase tracking-wider">
                {gameData.name}
              </h2>
              <p className="text-gray-300 mb-8 text-lg max-w-2xl">
                {gameData.description || 'A classic Commodore 64 experience'}
              </p>
            </div>
          )}
          
          {/* Game content - this is where the emulator will be mounted */}
          <div 
            ref={emulatorContainerRef}
            id="emulator-container" 
            className="w-full h-full"
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-white text-center bg-black/80 p-4 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                  <p>Loading game...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-red-400 bg-black/80 p-4 rounded-lg text-center">
                  {error}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Game Info */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">{gameData.name}</h2>
          <p className="text-gray-400 text-sm mb-4">
            {gameData.genre} • {gameData.year} • {gameData.publisher}
          </p>
          <p className="text-gray-300">{gameData.players}</p>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>Use arrow keys to navigate • Space to fire • Enter to start</p>
          </div>
        </div>
      </div>
    </div>
  );
}
