
import { useParams, useNavigate } from "react-router-dom";
import { VehicleOverview } from "./profile/VehicleOverview";
import { VehicleDocuments } from "./profile/VehicleDocuments";
import { MaintenanceHistory } from "./profile/MaintenanceHistory";
import { DamageHistory } from "./profile/DamageHistory";
import { VehicleTimeline } from "./profile/VehicleTimeline";
import { VehicleQRCode } from "./profile/VehicleQRCode";
import { VehicleInsurance } from "./profile/VehicleInsurance";
import { VehicleStatus } from "./profile/VehicleStatus";
import { DocumentExpiryNotifications } from "./profile/DocumentExpiryNotifications";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Car, 
  AlertTriangle, 
  FileText,
  ActivitySquare,
  CalendarClock,
  ClipboardList,
  Shield,
  Files,
  Wrench,
  History,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const VehicleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (!id) {
    return (
      <Card className="mx-auto max-w-lg mt-8">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-4">Vehicle ID is required</h2>
          <Button onClick={() => navigate("/vehicles")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vehicles
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[200px] rounded-lg" />
          <Skeleton className="h-[200px] rounded-lg" />
        </div>
        <Skeleton className="h-[300px] rounded-lg" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <Card className="mx-auto max-w-lg mt-8">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-4">Vehicle not found</h2>
          <Button onClick={() => navigate("/vehicles")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vehicles
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05]" />
        
        <div className="relative px-6 py-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/vehicles")}
                className="shrink-0 hover:scale-105 transition-transform bg-white/90 backdrop-blur-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Car className="h-8 w-8 text-primary animate-fade-in" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    VIN: {vehicle.vin}
                  </p>
                </div>
              </div>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg border shadow-sm hover:shadow-md transition-all cursor-help">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {vehicle.license_plate}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Vehicle License Plate
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Primary Action Cards */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-0">
            <VehicleQRCode 
              make={vehicle.make} 
              model={vehicle.model}
              vehicleId={id}
              year={vehicle.year}
              licensePlate={vehicle.license_plate}
              vin={vehicle.vin}
            />
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-0">
            <VehicleStatus 
              vehicleId={id} 
              currentStatus={vehicle.status} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Notifications Section */}
      <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-orange-50 to-white dark:from-gray-800 dark:to-gray-900">
        <CardContent className="p-0">
          <DocumentExpiryNotifications vehicleId={id} />
        </CardContent>
      </Card>
      
      {/* Vehicle Information Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-0">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Vehicle Overview</h2>
              </div>
              <VehicleOverview vehicleId={id} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-0">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Insurance Information</h2>
              </div>
              <VehicleInsurance vehicleId={id} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Documents and Maintenance Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-0">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2 mb-4">
                <Files className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Documents</h2>
              </div>
              <VehicleDocuments vehicleId={id} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-0">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Maintenance History</h2>
              </div>
              <MaintenanceHistory vehicleId={id} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Width Sections */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-0">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Damage History</h2>
            </div>
            <DamageHistory vehicleId={id} />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-0">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 mb-4">
              <History className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Vehicle Timeline</h2>
            </div>
            <VehicleTimeline vehicleId={id} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

