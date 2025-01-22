import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { formatDateToDisplay } from '@/lib/dateUtils';
import { Calendar, Clock, User } from 'lucide-react';

interface TaskNodeProps {
  data: {
    title: string;
    description: string;
    priority: string;
    status: string;
    scheduled_date: string;
    due_date: string;
    vehicle: {
      make: string;
      model: string;
      license_plate: string;
    };
    assignedTo: {
      full_name: string;
    };
  };
}

export const TaskNode = memo(({ data }: TaskNodeProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-[300px]">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold">{data.title}</h3>
          <Badge variant="outline" className={getPriorityColor(data.priority)}>
            {data.priority}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">{data.description}</p>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span>{formatDateToDisplay(new Date(data.scheduled_date))}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          <span>Due: {formatDateToDisplay(new Date(data.due_date))}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          <span>{data.assignedTo?.full_name || 'Unassigned'}</span>
        </div>

        <div className="text-sm text-muted-foreground">
          {data.vehicle?.make} {data.vehicle?.model} ({data.vehicle?.license_plate})
        </div>
      </div>
    </div>
  );
});

TaskNode.displayName = 'TaskNode';