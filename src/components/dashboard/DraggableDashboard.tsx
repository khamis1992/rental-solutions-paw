import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableWidget } from './DraggableWidget';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export interface Widget {
  id: string;
  type: string;
  component: React.ReactNode;
}

interface DraggableDashboardProps {
  initialWidgets: Widget[];
  onLayoutChange?: (widgets: Widget[]) => void;
}

export const DraggableDashboard = ({
  initialWidgets,
  onLayoutChange,
}: DraggableDashboardProps) => {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newWidgets = arrayMove(items, oldIndex, newIndex);
        onLayoutChange?.(newWidgets);
        return newWidgets;
      });

      toast({
        title: "Layout updated",
        description: "Your dashboard layout has been saved.",
      });
    }

    setActiveId(null);
  };

  const resetLayout = () => {
    setWidgets(initialWidgets);
    onLayoutChange?.(initialWidgets);
    toast({
      title: "Layout reset",
      description: "Your dashboard layout has been reset to default.",
    });
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-end">
        <Button onClick={resetLayout} variant="outline">
          Reset Layout
        </Button>
      </div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
            {widgets.map((widget) => (
              <DraggableWidget
                key={widget.id}
                widget={widget}
                isActive={activeId === widget.id}
              />
            ))}
          </SortableContext>
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="rounded-lg border bg-card p-4 shadow-lg">
              {widgets.find((w) => w.id === activeId)?.component}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};