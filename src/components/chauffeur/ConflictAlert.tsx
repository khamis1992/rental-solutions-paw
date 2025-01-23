import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const ConflictAlert = () => {
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    fetchConflicts();
    const channel = supabase
      .channel("schedule-conflicts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "schedule_conflicts",
        },
        () => fetchConflicts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchConflicts = async () => {
    const { data, error } = await supabase
      .from("schedule_conflicts")
      .select("*")
      .eq("status", "pending");

    if (!error && data) {
      setConflicts(data);
    }
  };

  if (conflicts.length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Schedule Conflicts Detected</AlertTitle>
      <AlertDescription>
        There are {conflicts.length} scheduling conflicts that need attention.
      </AlertDescription>
    </Alert>
  );
};