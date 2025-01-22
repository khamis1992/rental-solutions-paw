import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Car } from 'lucide-react';

interface VehicleNodeProps {
  data: {
    make: string;
    model: string;
    license_plate: string;
  };
}

export const VehicleNode = memo(({ data }: VehicleNodeProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      
      <div className="flex items-center gap-2">
        <Car className="h-5 w-5" />
        <div>
          <h3 className="font-semibold">{data.make} {data.model}</h3>
          <p className="text-sm text-muted-foreground">{data.license_plate}</p>
        </div>
      </div>
    </div>
  );
});

VehicleNode.displayName = 'VehicleNode';