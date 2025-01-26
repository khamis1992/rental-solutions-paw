import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ReportSchedule } from "@/types/finance.types";

export const ReportScheduler = () => {
  const queryClient = useQueryClient();

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["report-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_schedules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ReportSchedule[];
    }
  });

  const createSchedule = useMutation({
    mutationFn: async (newSchedule: Partial<ReportSchedule>) => {
      const { data, error } = await supabase
        .from("report_schedules")
        .insert(newSchedule)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-schedules"] });
      toast.success("Report schedule created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create report schedule");
      console.error("Error creating report schedule:", error);
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Report Scheduler</h2>
      <div className="grid gap-4">
        {schedules?.map((schedule) => (
          <div key={schedule.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{schedule.report_type}</h3>
            <p>Frequency: {schedule.frequency}</p>
            <p>Next Run: {schedule.next_run_at ? new Date(schedule.next_run_at).toLocaleString() : 'Not scheduled'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};