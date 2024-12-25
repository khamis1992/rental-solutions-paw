import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TrafficFinesDashboard } from "@/components/traffic-fines/TrafficFinesDashboard";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function TrafficFines() {
  const { toast } = useToast();

  const handleDeleteAll = async () => {
    try {
      const { error } = await supabase
        .from('traffic_fines')
        .delete()
        .neq('id', ''); // Delete all records

      if (error) throw error;

      toast({
        title: "Success",
        description: "All traffic fines have been deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete traffic fines",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Traffic Fines Management</h1>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteAll}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete All
          </Button>
        </div>
        <ErrorBoundary>
          <TrafficFinesDashboard />
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
}