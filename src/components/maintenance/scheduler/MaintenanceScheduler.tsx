import { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import '@xyflow/react/dist/style.css';
import { TaskNode } from './nodes/TaskNode';
import { VehicleNode } from './nodes/VehicleNode';

const nodeTypes = {
  task: TaskNode,
  vehicle: VehicleNode,
};

export function MaintenanceScheduler() {
  const queryClient = useQueryClient();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['maintenance-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select(`
          *,
          vehicles (
            id,
            make,
            model,
            license_plate
          ),
          profiles (
            id,
            full_name
          )
        `)
        .order('order_index');

      if (error) throw error;
      
      // Convert tasks to nodes
      const taskNodes: Node[] = data.map((task, index) => ({
        id: task.id,
        type: 'task',
        position: { x: 250, y: 50 + (index * 100) },
        data: {
          ...task,
          vehicle: task.vehicles,
          assignedTo: task.profiles
        },
      }));

      return taskNodes;
    },
  });

  const updateTaskPosition = useMutation({
    mutationFn: async ({ id, position, order_index }: { id: string, position: { x: number, y: number }, order_index: number }) => {
      const { error } = await supabase
        .from('maintenance_tasks')
        .update({ 
          order_index,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] });
    },
    onError: (error) => {
      toast.error('Failed to update task position');
      console.error('Error updating task position:', error);
    }
  });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      
      // Update task positions in database
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          updateTaskPosition.mutate({
            id: change.id,
            position: change.position,
            order_index: Math.floor(change.position.y / 100)
          });
        }
      });
    },
    [onNodesChange, updateTaskPosition]
  );

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  return (
    <Card className="h-[600px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
    </Card>
  );
}