import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const logActivity = async (activity: string, details: any) => {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert([{ 
        action: activity,
        changes: details,
        entity_type: 'system',
        entity_id: null
      }]);

    if (error) throw error;

    toast.success("Activity logged successfully");
  } catch (error) {
    console.error("Error logging activity:", error);
    toast.error("Failed to log activity");
  }
};

export const fetchActivityLogs = async () => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    toast.error("Failed to fetch activity logs");
    return [];
  }
};