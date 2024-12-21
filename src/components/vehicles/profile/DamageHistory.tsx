import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Image as ImageIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DamageHistoryProps {
  vehicleId: string;
}

// Split into smaller components for better maintainability
const PhotosDialog = ({ images, open, onOpenChange }: { 
  images: string[], 
  open: boolean, 
  onOpenChange: (open: boolean) => void 
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Inspection Photos</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {images.map((url, index) => (
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
);

const InspectionRecordsTable = ({ records }: { records: any[] }) => (
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
      {records.map((inspection) => (
        <TableRow key={inspection.id}>
          <TableCell>
            {new Date(inspection.inspection_date).toLocaleDateString()}
          </TableCell>
          <TableCell>{inspection.inspection_type}</TableCell>
          <TableCell>
            {inspection.damage_markers ? 
              JSON.parse(inspection.damage_markers).length + " damages marked"
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
);

const DamageReportsTable = ({ records }: { records: any[] }) => (
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
      {records.map((damage) => (
        <TableRow key={damage.id}>
          <TableCell>
            {new Date(damage.reported_date).toLocaleDateString()}
          </TableCell>
          <TableCell>{damage.description}</TableCell>
          <TableCell>{damage.notes}</TableCell>
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
);

export const DamageHistory = ({ vehicleId }: DamageHistoryProps) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showImagesDialog, setShowImagesDialog] = useState(false);
  const queryClient = useQueryClient();

  // Set up real-time listeners
  useEffect(() => {
    const inspectionChannel = supabase
      .channel('inspection-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicle_inspections',
          filter: `vehicle_id=eq.${vehicleId}`
        },
        async (payload) => {
          console.log('Inspection update received:', payload);
          await queryClient.invalidateQueries({ queryKey: ['damages-and-inspections', vehicleId] });
          toast.info('Vehicle inspection records updated');
        }
      )
      .subscribe();

    const damageChannel = supabase
      .channel('damage-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'damages',
          filter: `vehicle_id=eq.${vehicleId}`
        },
        async (payload) => {
          console.log('Damage update received:', payload);
          await queryClient.invalidateQueries({ queryKey: ['damages-and-inspections', vehicleId] });
          toast.info('Damage records updated');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(inspectionChannel);
      supabase.removeChannel(damageChannel);
    };
  }, [vehicleId, queryClient]);

  const { data: records, isLoading } = useQuery({
    queryKey: ["damages-and-inspections", vehicleId],
    queryFn: async () => {
      // Get inspection records
      const { data: inspectionData, error: inspectionError } = await supabase
        .from("vehicle_inspections")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("inspection_date", { ascending: false });

      if (inspectionError) throw inspectionError;

      // Get damage records
      const { data: damageData, error: damageError } = await supabase
        .from("damages")
        .select("*, leases(customer_id, profiles(full_name))")
        .eq("vehicle_id", vehicleId)
        .order("reported_date", { ascending: false });

      if (damageError) throw damageError;

      return {
        inspections: inspectionData || [],
        damages: damageData || [],
      };
    },
  });

  const handleViewImages = (images: string[]) => {
    setSelectedImages(images);
    setShowImagesDialog(true);
  };

  if (isLoading) {
    return <div>Loading damage history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Damage & Service History
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Inspection Records */}
          <div>
            <h3 className="text-sm font-medium mb-3">Inspection Records</h3>
            <InspectionRecordsTable records={records?.inspections || []} />
          </div>

          {/* Damage Records */}
          <div>
            <h3 className="text-sm font-medium mb-3">Damage Reports</h3>
            <DamageReportsTable records={records?.damages || []} />
          </div>
        </div>
      </CardContent>

      {/* Photos Dialog */}
      <PhotosDialog 
        images={selectedImages}
        open={showImagesDialog}
        onOpenChange={setShowImagesDialog}
      />
    </Card>
  );
};