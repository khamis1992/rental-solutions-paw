import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Wrench, Plus, Image as ImageIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DamageAssessment } from "@/components/agreements/details/DamageAssessment";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DamageHistoryProps {
  vehicleId: string;
}

export const DamageHistory = ({ vehicleId }: DamageHistoryProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showImagesDialog, setShowImagesDialog] = useState(false);

  const { data: records, isLoading } = useQuery({
    queryKey: ["damages-and-inspections", vehicleId],
    queryFn: async () => {
      // First, get maintenance records for this vehicle
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from("maintenance")
        .select("service_type, description, cost, scheduled_date")
        .eq("vehicle_id", vehicleId)
        .order("scheduled_date", { ascending: false });

      if (maintenanceError) throw maintenanceError;

      // Get damage records
      const { data: damageData, error: damageError } = await supabase
        .from("damages")
        .select("*, leases(customer_id, profiles(full_name))")
        .eq("vehicle_id", vehicleId)
        .order("reported_date", { ascending: false });

      if (damageError) throw damageError;

      // Get inspection records with photos
      const { data: inspectionData, error: inspectionError } = await supabase
        .from("vehicle_inspections")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("inspection_date", { ascending: false });

      if (inspectionError) throw inspectionError;

      return {
        maintenance: maintenanceData || [],
        damages: damageData || [],
        inspections: inspectionData || [],
      };
    },
  });

  // Get the active lease for this vehicle
  const { data: activeLease } = useQuery({
    queryKey: ["active-lease", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select("id")
        .eq("vehicle_id", vehicleId)
        .eq("status", "active")
        .single();

      if (error) return null;
      return data;
    },
  });

  const handleViewImages = (images: string[]) => {
    setSelectedImages(images);
    setShowImagesDialog(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Damage & Service History
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Damage Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Damage Report</DialogTitle>
              </DialogHeader>
              {activeLease ? (
                <DamageAssessment 
                  agreementId={activeLease.id} 
                  onSuccess={() => setIsDialogOpen(false)}
                />
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No active lease found for this vehicle. A damage report can only be created for vehicles with active leases.
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Inspection Records */}
          <div>
            <h3 className="text-sm font-medium mb-3">Inspection Records</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Damage Markers</TableHead>
                  <TableHead>Photos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records?.inspections.map((inspection) => (
                  <TableRow key={inspection.id}>
                    <TableCell>
                      {new Date(inspection.inspection_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{inspection.inspection_type}</TableCell>
                    <TableCell>
                      {inspection.damage_markers ? 
                        JSON.parse(inspection.damage_markers as string).length + " damages marked"
                        : "No damages"}
                    </TableCell>
                    <TableCell>
                      {inspection.inspection_photos && inspection.inspection_photos.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewImages(inspection.inspection_photos)}
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          View Photos ({inspection.inspection_photos.length})
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Damage Records */}
          <div>
            <h3 className="text-sm font-medium mb-3">Damage Reports</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records?.damages.map((damage) => (
                  <TableRow key={damage.id}>
                    <TableCell>
                      {new Date(damage.reported_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{damage.description}</TableCell>
                    <TableCell>{damage.damage_location}</TableCell>
                    <TableCell>
                      {(damage.leases as any)?.profiles?.full_name || "N/A"}
                    </TableCell>
                    <TableCell>
                      {damage.images && damage.images.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewImages(damage.images)}
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          View Photos ({damage.images.length})
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">{damage.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {/* Images Dialog */}
      <Dialog open={showImagesDialog} onOpenChange={setShowImagesDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Inspection Photos</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {selectedImages.map((url, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={url}
                  alt={`Inspection photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};