import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateJobDialog } from "./CreateJobDialog";

export function MaintenanceList() {
  const { data: maintenanceData, isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance data:', error);
        throw error;
      }

      return data || [];
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Maintenance Jobs</h2>
        <CreateJobDialog vehicleId="your-vehicle-id">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Job Card
          </Button>
        </CreateJobDialog>
      </div>

      {/* Add your maintenance list table or grid here */}
      <div className="grid gap-4">
        {maintenanceData?.map((job) => (
          <div key={job.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{job.service_type}</h3>
            <p className="text-sm text-gray-600">{job.description}</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-sm">{new Date(job.created_at).toLocaleDateString()}</span>
              <span className="capitalize px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {job.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}