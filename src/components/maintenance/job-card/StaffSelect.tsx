import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StaffSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function StaffSelect({ value, onValueChange }: StaffSelectProps) {
  const { data: staff = [] } = useQuery({
    queryKey: ["staff-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "staff");
      
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-2">
      <Label htmlFor="performed_by">Assigned Staff</Label>
      <Select
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger id="performed_by">
          <SelectValue placeholder="Select staff member" />
        </SelectTrigger>
        <SelectContent>
          {staff.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              {member.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}