import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Widget } from './DraggableDashboard';
import { cn } from '@/lib/utils';

interface DraggableWidgetProps {
  widget: Widget;
  isActive?: boolean;
}

export const DraggableWidget = ({ widget, isActive }: DraggableWidgetProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border bg-card p-4',
        isDragging ? 'opacity-50' : 'opacity-100',
        isActive ? 'ring-2 ring-primary' : ''
      )}
      {...attributes}
      {...listeners}
    >
      {widget.component}
    </div>
  );
};