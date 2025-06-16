'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import './joystick.module.css';

export type JoystickDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'BUTTON' | null;

interface JoystickProps {
  onMove?: (direction: JoystickDirection) => void;
  onStop?: () => void;
}

const Joystick = ({ onMove, onStop }: JoystickProps) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState<JoystickDirection>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!joystickRef.current) return;
    
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setStartPos({ x: centerX, y: centerY });
    setIsActive(true);
    
    // Prevent default to avoid scrolling
    e.preventDefault();
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isActive) return;
      
      const touch = e.touches[0];
      const rect = joystickRef.current!.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = touch.clientX - centerX;
      const y = touch.clientY - centerY;
      
      // Limit joystick movement to the container
      const distance = Math.min(Math.sqrt(x * x + y * y), 50);
      const angle = Math.atan2(y, x);
      
      setPosition({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      });
      
      // Determine direction (using uppercase to match JoystickDirection type)
      const angleDeg = (angle * 180) / Math.PI;
      let newDirection: JoystickDirection = null;
      
      if (distance > 10) {
        if (angleDeg >= -45 && angleDeg < 45) {
          newDirection = 'RIGHT';
        } else if (angleDeg >= 45 && angleDeg < 135) {
          newDirection = 'DOWN';
        } else if (angleDeg >= -135 && angleDeg < -45) {
          newDirection = 'UP';
        } else {
          newDirection = 'LEFT';
        }
      }
      
      if (newDirection !== direction) {
        setDirection(newDirection);
        onMove?.(newDirection);
      }
    },
    [isActive, direction, onMove]
  );

  const handleTouchEnd = useCallback(() => {
    if (isActive) {
      setIsActive(false);
      setPosition({ x: 0, y: 0 });
      setDirection(null);
      onStop?.();
    }
  }, [isActive, onStop]);

  useEffect(() => {
    const joystick = joystickRef.current;
    if (!joystick) return;
    
    joystick.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      joystick.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div 
      ref={joystickRef}
      className="relative w-32 h-32 rounded-full bg-gray-800/50 border-2 border-gray-600/50 touch-none"
    >
      <div 
        className="absolute w-16 h-16 bg-white/30 rounded-full border-2 border-white/50 transition-transform"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: '50%',
          top: '50%',
          marginLeft: '-1.5rem',
          marginTop: '-1.5rem',
        }}
      />
    </div>
  );
};

export default Joystick;
