import { useQuery } from "@tanstack/react-query";
import { TrafficFineStats } from "./TrafficFineStats";
import { TrafficFineImport } from "./TrafficFineImport";
import { TrafficFinesList } from "./TrafficFinesList";
import { ManualTrafficFineDialog } from "./ManualTrafficFineDialog";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FilePlus, FileUp, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function TrafficFinesDashboard() {
  const { data: finesCount, refetch } = useQuery({
    queryKey: ["traffic-fines-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('traffic_fines')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const handleDeleteAll = async () => {
    try {
      const { error } = await supabase
        .from('traffic_fines')
        .delete()
        .neq('id', ''); // Delete all records

      if (error) throw error;
      toast.success("All traffic fines have been deleted");
      refetch();
    } catch (error) {
      console.error('Error deleting traffic fines:', error);
      toast.error("Failed to delete traffic fines");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* New Fine Button */}
          <Button
            variant="outline"
            className="w-full bg-white hover:bg-gray-50 flex items-center gap-2 p-6 h-auto"
            onClick={() => document.getElementById('add-fine-dialog')?.click()}
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FilePlus className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-lg font-medium">New Fine</span>
          </Button>

          {/* Import Fines Button */}
          <Button
            variant="outline"
            className="w-full bg-white hover:bg-gray-50 flex items-center gap-2 p-6 h-auto"
            onClick={() => document.getElementById('import-fines-input')?.click()}
          >
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <FileUp className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-lg font-medium">Import Fines</span>
          </Button>

          {/* Delete All Button */}
          <Button
            variant="outline"
            className="w-full bg-white hover:bg-red-50 border-red-100 text-red-600 flex items-center gap-2 p-6 h-auto"
            onClick={handleDeleteAll}
          >
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <span className="text-lg font-medium">Delete All</span>
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <ErrorBoundary>
          <TrafficFineStats paymentCount={finesCount || 0} />
        </ErrorBoundary>
        <ManualTrafficFineDialog onFineAdded={refetch} />
      </div>
      
      <ErrorBoundary>
        <TrafficFineImport />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <TrafficFinesList />
      </ErrorBoundary>
    </div>
  );
}