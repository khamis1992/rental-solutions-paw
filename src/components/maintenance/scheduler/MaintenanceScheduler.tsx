import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskNode } from './nodes/TaskNode';
import { VehicleNode } from './nodes/VehicleNode';

export function MaintenanceScheduler() {
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
      return data;
    },
  });

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {tasks?.map((task) => (
          <div key={task.id} className="bg-white rounded-lg shadow p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold">{task.title}</h3>
                <div className={`px-2 py-1 rounded text-sm ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">{task.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Scheduled:</span>{' '}
                  {new Date(task.scheduled_date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Due:</span>{' '}
                  {new Date(task.due_date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Assigned to:</span>{' '}
                  {task.profiles?.full_name || 'Unassigned'}
                </div>
                <div>
                  <span className="font-medium">Vehicle:</span>{' '}
                  {task.vehicles?.make} {task.vehicles?.model} ({task.vehicles?.license_plate})
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}