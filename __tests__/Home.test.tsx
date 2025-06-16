import { render, screen, fireEvent, within, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';

// Mock the C64Emulator class
jest.mock('@/lib/emulator', () => {
  const originalModule = jest.requireActual('@/lib/emulator');
  
  // Create a mock implementation that tracks method calls
  const mockEmulator = {
    initialize: jest.fn().mockImplementation(function(this: any) {
      this.status = 'ready';
    }),
    loadGame: jest.fn().mockResolvedValue(undefined),
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn(),
    destroy: jest.fn(),
    onError: jest.fn(function(this: any, callback) { 
      this.errorCallback = callback; 
      return this; 
    }),
    onProgress: jest.fn(function(this: any, callback) { 
      this.progressCallback = callback; 
      return this; 
    }),
    isGameRunning: jest.fn().mockReturnValue(false),
  };

  return {
    ...originalModule,
    C64Emulator: jest.fn().mockImplementation(() => mockEmulator),
    __mockEmulator: mockEmulator, // Expose the mock for test setup
  };
});

describe('Home', () => {
  beforeEach(() => {
    // Setup fake timers for testing async operations
    jest.useFakeTimers();
    
    // Mock the canvas getContext method
    HTMLCanvasElement.prototype.getContext = jest.fn();
  });

  afterEach(() => {
    // Restore real timers after each test
    jest.useRealTimers();
  });

  it('shows loading state when Start Game is clicked', async () => {
    render(<Home />);
    
    // Click the start game button
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);
    
    // Verify loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(startButton).toBeDisabled();
  });

  it('shows loading state and completes game start', async () => {
    render(<Home />);
    
    // Click the start game button
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);
    
    // Verify loading state is shown by checking if the button is disabled
    expect(startButton).toBeDisabled();
    
    // Fast-forward timers to complete loading
    await act(async () => {
      jest.runAllTimers();
    });
    
    // The start button should be hidden when game is running
    const startButtonAfter = screen.queryByRole('button', { name: /start game/i });
    expect(startButtonAfter).not.toBeInTheDocument();
    
    // Verify the game canvas is visible
    const gameCanvas = document.getElementById('game-canvas');
    expect(gameCanvas).toBeInTheDocument();
  });

  it('shows the joystick component on mobile', () => {
    // Mock window.innerWidth for mobile view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // Mobile width
    });
    
    // Trigger window resize event
    window.dispatchEvent(new Event('resize'));
    
    render(<Home />);
    
    // Verify mobile joystick instructions are shown
    expect(screen.getByText('Use the on-screen joystick to play')).toBeInTheDocument();
  });

  it('shows the game information section', () => {
    render(<Home />);
    
    // Verify game info is shown
    expect(screen.getByText('Use keyboard or the on-screen joystick to play')).toBeInTheDocument();
    expect(screen.getByText("Today's game: Blockheads")).toBeInTheDocument();
  });
});
