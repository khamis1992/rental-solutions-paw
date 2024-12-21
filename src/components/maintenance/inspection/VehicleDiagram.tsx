import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";

interface DamageMarker {
  id: string;
  x: number;
  y: number;
  view: string;
  description: string;
  photoUrl?: string;
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
  onMarkersChange 
}: VehicleDiagramProps) => {
  const [activeView, setActiveView] = useState<string>("front");
  const [selectedMarker, setSelectedMarker] = useState<DamageMarker | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newMarker: DamageMarker = {
      id: Date.now().toString(),
      x,
      y,
      view: activeView,
      description: "",
    };

    // Generate automatic description
    newMarker.description = generateDescription(newMarker);

    const updatedMarkers = [...damageMarkers, newMarker];
    onMarkersChange(updatedMarkers);
    setSelectedMarker(newMarker);

    // Show toast notification
    toast.info("Damage marker added with automatic description");
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedMarker) return;

    const updatedSelectedMarker = {
      ...selectedMarker,
      description: e.target.value
    };

    const updatedMarkers = damageMarkers.map(marker =>
      marker.id === selectedMarker.id ? updatedSelectedMarker : marker
    );

    onMarkersChange(updatedMarkers);
    setSelectedMarker(updatedSelectedMarker);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button
          variant={activeView === "front" ? "default" : "outline"}
          onClick={() => setActiveView("front")}
        >
          Front
        </Button>
        <Button
          variant={activeView === "rear" ? "default" : "outline"}
          onClick={() => setActiveView("rear")}
        >
          Rear
        </Button>
        <Button
          variant={activeView === "left" ? "default" : "outline"}
          onClick={() => setActiveView("left")}
        >
          Left Side
        </Button>
        <Button
          variant={activeView === "right" ? "default" : "outline"}
          onClick={() => setActiveView("right")}
        >
          Right Side
        </Button>
        <Button
          variant={activeView === "top" ? "default" : "outline"}
          onClick={() => setActiveView("top")}
        >
          Top
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div
            className="relative w-full h-[400px] border rounded-lg bg-white"
            onClick={handleClick}
          >
            <img 
              src="/lovable-uploads/3902a0a3-bb90-442e-b11d-4a21abda0543.png"
              alt="Vehicle diagram"
              className="w-full h-full object-contain"
            />

            {damageMarkers
              .filter(marker => marker.view === activeView)
              .map(marker => (
                <div
                  key={marker.id}
                  className="absolute w-4 h-4 bg-red-500 rounded-full -translate-x-2 -translate-y-2 cursor-pointer hover:ring-2 hover:ring-red-300"
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMarker(marker);
                  }}
                />
              ))}
          </div>
        </CardContent>
      </Card>

      {selectedMarker && (
        <div className="space-y-2">
          <h4 className="font-medium">Damage Description</h4>
          <Textarea
            value={selectedMarker.description}
            onChange={handleDescriptionChange}
            placeholder="Describe the damage..."
            className="min-h-[100px]"
          />
        </div>
      )}
    </div>
  );
};