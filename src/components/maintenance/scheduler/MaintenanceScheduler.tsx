import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const MaintenanceScheduler = () => {
  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ['maintenance-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select(`
          *,
          vehicles (
            make,
            model,
            license_plate
          ),
          profiles (
            full_name
          )
        `)
        .order('scheduled_date', { ascending: true });

      if (error) {
        toast.error('Failed to fetch maintenance tasks');
        throw error;
      }

      return data;
    },
  });

  const handleRefresh = () => {
    refetch();
    toast.success('Tasks refreshed');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Scheduled Maintenance</CardTitle>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading tasks...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks?.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    {task.vehicles?.make} {task.vehicles?.model} ({task.vehicles?.license_plate})
                  </TableCell>
                  <TableCell>{task.profiles?.full_name}</TableCell>
                  <TableCell>{new Date(task.scheduled_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(task.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>{task.priority}</TableCell>
                  <TableCell>{task.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};