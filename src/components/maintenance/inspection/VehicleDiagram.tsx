import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DamageMarker {
  x: number;
  y: number;
  view: string;
}

interface VehicleDiagramProps {
  damageMarkers: DamageMarker[];
  onMarkersChange: (markers: DamageMarker[]) => void;
}

const generateDescription = (marker: DamageMarker): string => {
  // Convert percentages to a 0-100 scale for easier reading
  const xPos = marker.x;
  const yPos = marker.y;
  
  // Define specific zones based on view
  const getSpecificZone = (x: number, y: number, view: string) => {
    if (view === "front" || view === "rear") {
      const verticalZone = y < 33 ? "upper" : y < 66 ? "middle" : "lower";
      const horizontalZone = x < 33 ? "left" : x < 66 ? "center" : "right";
      return `${verticalZone} ${horizontalZone}`;
    }
    
    if (view === "left" || view === "right") {
      const verticalZone = y < 33 ? "roof line" : y < 66 ? "door level" : "lower panel";
      let horizontalZone = "";
      if (x < 25) horizontalZone = "front quarter";
      else if (x < 50) horizontalZone = "front door area";
      else if (x < 75) horizontalZone = "rear door area";
      else horizontalZone = "rear quarter";
      return `${horizontalZone} at ${verticalZone}`;
    }
    
    if (view === "top") {
      const lengthZone = y < 33 ? "front" : y < 66 ? "middle" : "rear";
      const widthZone = x < 33 ? "left" : x < 66 ? "center" : "right";
      return `${lengthZone} ${widthZone}`;
    }
    
    return "unspecified area";
  };

  // Get the specific zone
  const specificZone = getSpecificZone(xPos, yPos, marker.view);
  
  // Generate appropriate preposition based on view
  const preposition = marker.view === "top" ? "on" : "in";
  
  // Format the view description
  const viewDescription = marker.view === "left" || marker.view === "right" 
    ? `${marker.view} side` 
    : marker.view;

  // Generate the full description
  return `Damage detected ${preposition} the ${specificZone} section of the vehicle's ${viewDescription}`;
};

export const VehicleDiagram = ({
  damageMarkers,
  onMarkersChange,
}: VehicleDiagramProps) => {
  const [currentView, setCurrentView] = useState<string>("front");

  const handleViewChange = (view: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentView(view);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newMarker = {
      x,
      y,
      view: currentView,
    };

    const description = generateDescription(newMarker);
    toast.success(`Added damage marker: ${description}`);

    onMarkersChange([...damageMarkers, newMarker]);
  };

  const getViewImage = (view: string) => {
    const basePath = "/lovable-uploads/40fc6606-d650-4614-9d15-11d1791e8c28.png";
    return basePath;
  };

  // Calculate the image position based on the current view
  const getImageStyle = () => {
    switch (currentView) {
      case "front":
        return { objectPosition: "0% 33%", objectFit: "cover" as const };
      case "rear":
        return { objectPosition: "100% 33%", objectFit: "cover" as const };
      case "left":
        return { objectPosition: "0% 66%", objectFit: "cover" as const };
      case "right":
        return { objectPosition: "100% 66%", objectFit: "cover" as const };
      case "top":
        return { objectPosition: "50% 0%", objectFit: "cover" as const };
      default:
        return { objectPosition: "0% 33%", objectFit: "cover" as const };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={currentView === "front" ? "default" : "outline"}
          onClick={handleViewChange("front")}
        >
          Front
        </Button>
        <Button
          type="button"
          variant={currentView === "rear" ? "default" : "outline"}
          onClick={handleViewChange("rear")}
        >
          Rear
        </Button>
        <Button
          type="button"
          variant={currentView === "left" ? "default" : "outline"}
          onClick={handleViewChange("left")}
        >
          Left Side
        </Button>
        <Button
          type="button"
          variant={currentView === "right" ? "default" : "outline"}
          onClick={handleViewChange("right")}
        >
          Right Side
        </Button>
        <Button
          type="button"
          variant={currentView === "top" ? "default" : "outline"}
          onClick={handleViewChange("top")}
        >
          Top
        </Button>
      </div>

      <div
        className="relative w-full aspect-[3/2] border rounded-lg cursor-crosshair bg-gray-50 overflow-hidden"
        onClick={handleClick}
      >
        <img
          src={getViewImage(currentView)}
          alt={`Vehicle ${currentView} view`}
          className="w-full h-full"
          style={getImageStyle()}
        />
        {damageMarkers
          .filter((marker) => marker.view === currentView)
          .map((marker, index) => (
            <div
              key={index}
              className="absolute w-3 h-3 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${marker.x}%`,
                top: `${marker.y}%`,
              }}
            />
          ))}
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Damage Markers:</h4>
        <ul className="space-y-1 text-sm">
          {damageMarkers.map((marker, index) => (
            <li key={index}>{generateDescription(marker)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};