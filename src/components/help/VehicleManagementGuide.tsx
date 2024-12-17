import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Car } from "lucide-react";

export const VehicleManagementGuide = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Vehicle Management Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <img
              src="/placeholder.svg"
              alt="Vehicle management interface"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Managing Your Fleet</h3>
            <p className="text-muted-foreground">
              Our vehicle management system provides comprehensive tools for maintaining 
              and optimizing your fleet operations. Learn how to effectively manage 
              every aspect of your vehicles.
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Adding New Vehicles</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Click the "Add Vehicle" button in the Vehicles section</li>
                  <li>Enter vehicle details including make, model, and year</li>
                  <li>Upload vehicle images and documentation</li>
                  <li>Set rental rates and availability status</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Maintenance Management</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Schedule regular maintenance checks</li>
                  <li>Track maintenance history and costs</li>
                  <li>Set up maintenance alerts and reminders</li>
                  <li>Monitor vehicle condition and mileage</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Vehicle Status Tracking</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Real-time availability monitoring</li>
                  <li>Track vehicle location and usage</li>
                  <li>Monitor rental history and performance</li>
                  <li>Generate vehicle utilization reports</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};