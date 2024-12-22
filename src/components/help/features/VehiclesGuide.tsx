import { Card, CardContent } from "@/components/ui/card";
import { Car } from "lucide-react";

export const VehiclesGuide = () => {
  return (
    <Card className="border rounded-lg px-4">
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          <h3 className="text-lg font-medium">Vehicles Module</h3>
        </div>
        <div className="space-y-4">
          <section>
            <h4 className="font-medium mb-2">Fleet Management</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Add and update vehicle information</li>
              <li>Track vehicle status and availability</li>
              <li>Monitor mileage and fuel levels</li>
              <li>Schedule routine maintenance</li>
            </ul>
          </section>
          <section>
            <h4 className="font-medium mb-2">Maintenance Tracking</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Log maintenance activities and costs</li>
              <li>Set up maintenance schedules</li>
              <li>Track repair history</li>
              <li>Generate maintenance reports</li>
            </ul>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};