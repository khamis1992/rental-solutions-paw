import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VehicleOverview } from "./profile/VehicleOverview";
import { MaintenanceHistory } from "./profile/MaintenanceHistory";
import { DamageHistory } from "./profile/DamageHistory";
import { AssociatedAgreements } from "./profile/AssociatedAgreements";
import { VehicleDocuments } from "./profile/VehicleDocuments";
import { InsuranceDetails } from "./profile/InsuranceDetails";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { injectPrintStyles } from "@/lib/printStyles";

interface VehicleDetailsProps {
  vehicleId: string;
}

const VehicleDetails = ({ vehicleId }: VehicleDetailsProps) => {
  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: async () => {
      const [vehicleResponse, insuranceResponse] = await Promise.all([
        supabase
          .from("vehicles")
          .select("*")
          .eq("id", vehicleId)
          .single(),
        supabase
          .from("vehicle_insurance")
          .select("*")
          .eq("vehicle_id", vehicleId)
          .single()
      ]);

      if (vehicleResponse.error) throw vehicleResponse.error;
      
      return {
        ...vehicleResponse.data,
        insurance: insuranceResponse.data
      };
    },
  });

  const handlePrint = () => {
    injectPrintStyles();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[150px]" />
          <Skeleton className="h-[150px]" />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return <div>Vehicle not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vehicle Details</h1>
        <Button
          onClick={handlePrint}
          variant="outline"
          className="print:hidden"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Details
        </Button>
      </div>

      {/* Vehicle Overview */}
      <VehicleOverview vehicle={vehicle} />

      {/* Insurance Details */}
      <InsuranceDetails vehicleId={vehicleId} insurance={vehicle.insurance} />

      {/* Vehicle Information Tabs */}
      <Tabs defaultValue="maintenance" className="w-full">
        <TabsList className="grid w-full grid-cols-4 print:hidden">
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="damages">Damages</TabsTrigger>
          <TabsTrigger value="agreements">Agreements</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance" className="mt-6 print:hidden">
          <MaintenanceHistory vehicleId={vehicleId} />
        </TabsContent>

        <TabsContent value="damages" className="mt-6 print:hidden">
          <DamageHistory vehicleId={vehicleId} />
        </TabsContent>

        <TabsContent value="agreements" className="mt-6 print:hidden">
          <AssociatedAgreements vehicleId={vehicleId} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6 print:hidden">
          <VehicleDocuments vehicleId={vehicleId} />
        </TabsContent>
      </Tabs>

      {/* Print-only content */}
      <style type="text/css" media="print">
        {`
          @page {
            size: auto;
            margin: 20mm;
          }
          
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>
    </div>
  );
};

export default VehicleDetails;