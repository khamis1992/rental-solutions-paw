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

    const updatedMarkers = [...damageMarkers, newMarker];
    onMarkersChange(updatedMarkers);
    setSelectedMarker(newMarker);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedMarker) return;

    const updatedMarkers = damageMarkers.map(marker =>
      marker.id === selectedMarker.id
        ? { ...marker, description: e.target.value }
        : marker
    );

    onMarkersChange(updatedMarkers);
    setSelectedMarker({ ...selectedMarker, description: e.target.value });
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
            onChange={handleDescriptionChange}
            placeholder="Describe the damage..."
            className="min-h-[100px]"
          />
        </div>
      )}
    </div>
  );
};