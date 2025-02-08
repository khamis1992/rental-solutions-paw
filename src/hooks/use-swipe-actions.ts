
import { useState, useRef, TouchEvent } from 'react';

interface SwipeActionsProps {
  onDelete?: () => void;
  onEdit?: () => void;
  threshold?: number;
}

export const useSwipeActions = ({ onDelete, onEdit, threshold = 100 }: SwipeActionsProps = {}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startXRef.current - currentX;
    
    // Limit swipe to left only and max threshold
    const newOffset = Math.max(0, Math.min(diff, threshold));
    setSwipeOffset(newOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (swipeOffset > threshold * 0.6) {
      // Show delete confirmation
      if (onDelete) {
        setSwipeOffset(threshold);
        // Trigger haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    } else {
      setSwipeOffset(0);
    }
  };

  return {
    swipeOffset,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    resetSwipe: () => setSwipeOffset(0),
  };
};

