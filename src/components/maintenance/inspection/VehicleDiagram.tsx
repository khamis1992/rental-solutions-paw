import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface DamageMarker {
  id: string;
  x: number;
  y: number;
  view: string;
  description: string;
}

interface VehicleDiagramProps {
  damageMarkers: DamageMarker[];
  onMarkersChange: (markers: DamageMarker[]) => void;
}

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

    setSelectedMarker(newMarker);
    onMarkersChange([...damageMarkers, newMarker]);
  };

  const handleDescriptionChange = (description: string) => {
    if (!selectedMarker) return;

    const updatedMarkers = damageMarkers.map(marker =>
      marker.id === selectedMarker.id
        ? { ...marker, description }
        : marker
    );

    onMarkersChange(updatedMarkers);
  };

  const getViewImage = (view: string) => {
    switch (view) {
      case "front":
        return "/lovable-uploads/fffa25ce-6a81-4f9a-813b-f3a5fab6bc77.png";
      default:
        return null;
    }
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
            className="relative w-full h-[400px] border rounded-lg bg-gray-100"
            onClick={handleClick}
          >
            {getViewImage(activeView) ? (
              <img
                src={getViewImage(activeView)}
                alt={`${activeView} view`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                {activeView.charAt(0).toUpperCase() + activeView.slice(1)} View
              </div>
            )}

            {/* Damage Markers */}
            {damageMarkers
              .filter(marker => marker.view === activeView)
              .map(marker => (
                <div
                  key={marker.id}
                  className="absolute w-4 h-4 bg-red-500 rounded-full -translate-x-2 -translate-y-2 cursor-pointer"
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
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Describe the damage..."
          />
        </div>
      )}
    </div>
  );
};