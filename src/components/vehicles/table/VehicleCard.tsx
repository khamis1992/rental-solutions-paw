
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Vehicle } from "@/types/vehicle";
import { VehicleStatusCell } from "./VehicleStatusCell";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Car } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSwipeActions } from "@/hooks/use-swipe-actions";

interface VehicleCardProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
}

export const VehicleCard = ({ vehicle, isSelected, onSelect }: VehicleCardProps) => {
  const { swipeOffset, handlers, resetSwipe } = useSwipeActions({
    threshold: 100,
  });

  return (
    <Card 
      className={cn(
        "group relative transition-all duration-200",
        "hover:shadow-md active:scale-[0.98]",
        "bg-white/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800",
        "overflow-hidden touch-manipulation",
        isSelected && "ring-2 ring-primary",
      )}
      {...handlers}
      style={{
        transform: `translateX(-${swipeOffset}px)`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />
      
      <div 
        className="absolute right-2 top-2 z-10"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(!isSelected);
        }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          className="rounded border-gray-300"
        />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 font-medium">
          <Car className="h-4 w-4 text-muted-foreground" />
          {vehicle.license_plate}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Make & Model</span>
            <span className="font-medium">{vehicle.make} {vehicle.model}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Year</span>
            <span>{vehicle.year}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <VehicleStatusCell status={vehicle.status} vehicleId={vehicle.id} />
          </div>

          {vehicle.location && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Location</span>
              <span>{vehicle.location}</span>
            </div>
          )}

          {vehicle.insurance_company && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Insurance</span>
              <span>{vehicle.insurance_company}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            className="hover:bg-primary/10"
          >
            <Link to={`/vehicles/${vehicle.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="hover:bg-primary/10"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
