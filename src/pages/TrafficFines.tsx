import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TrafficFinesDashboard } from "@/components/traffic-fines/TrafficFinesDashboard";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TrafficFines() {
  const { toast } = useToast();

  const handleDeleteAll = async () => {
    try {
      console.log('Starting delete all operation');
      
      const { data, error } = await supabase
        .from('traffic_fines')
        .delete()
        .neq('id', null)
        .select();

      if (error) {
        console.error('Delete operation failed:', error);
        throw error;
      }

      console.log('Delete operation successful:', data);
      
      toast({
        title: "Success",
        description: "All traffic fines have been deleted",
      });
    } catch (error: any) {
      console.error('Delete operation failed:', error);
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all traffic fines
                  from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll}>
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <ErrorBoundary>
          <TrafficFinesDashboard />
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
}