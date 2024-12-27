import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

interface VehicleLocationCellProps {
  isEditing: boolean;
  location: string | null;
  locationValue: string;
  onLocationChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onBlur: () => void;
  onClick: (e: React.MouseEvent) => void;
}

export const VehicleLocationCell = ({
  isEditing,
  location,
  locationValue,
  onLocationChange,
  onKeyPress,
  onBlur,
  onClick,
}: VehicleLocationCellProps) => {
  if (isEditing) {
    return (
      <div className="flex items-center" onClick={e => e.stopPropagation()}>
        <Input
          value={locationValue}
          onChange={(e) => onLocationChange(e.target.value)}
          onKeyDown={onKeyPress}
          onBlur={onBlur}
          autoFocus
          className="w-full"
          placeholder="Enter location"
        />
      </div>
    );
  }

  return (
    <div 
      className="flex items-center hover:bg-gray-100 p-2 rounded cursor-pointer" 
      onClick={onClick}
    >
      <MapPin className="h-4 w-4 mr-1" />
      {location || <span className="text-muted-foreground">Not available</span>}
    </div>
  );
};