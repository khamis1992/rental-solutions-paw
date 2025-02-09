
import { useState, useRef, TouchEvent } from 'react';

interface SwipeActionsProps {
  onDelete?: () => void;
  onEdit?: () => void;
  threshold?: number;
}

export const useSwipeActions = ({ onDelete, onEdit, threshold = 80 }: SwipeActionsProps = {}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const lastOffsetRef = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    lastOffsetRef.current = swipeOffset;
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startXRef.current - currentX;
    
    // Add resistance to the swipe as it approaches the threshold
    const resistance = Math.min(1, (threshold - Math.abs(diff)) / threshold);
    const newOffset = Math.max(0, Math.min(diff * resistance, threshold));
    
    setSwipeOffset(newOffset);

    // Provide haptic feedback at specific points
    if (newOffset > threshold * 0.5 && lastOffsetRef.current <= threshold * 0.5) {
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (swipeOffset > threshold * 0.6) {
      setSwipeOffset(threshold);
      if (onDelete) {
        // Stronger haptic feedback for action confirmation
        if (navigator.vibrate) {
          navigator.vibrate([30, 20, 30]);
        }
        onDelete();
      }
    } else {
      // Spring back animation handled by CSS transition
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
