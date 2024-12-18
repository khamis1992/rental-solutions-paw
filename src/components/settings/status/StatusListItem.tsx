import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { Check, Pencil, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StatusListItemProps {
  status: {
    id: string;
    name: string;
    is_active: boolean;
  };
  onUpdate: (id: string, name: string) => Promise<void>;
  onToggle: (id: string, currentActive: boolean) => Promise<void>;
}

export const StatusListItem = ({ status, onUpdate, onToggle }: StatusListItemProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Query to get the count of vehicles with this status
  const { data: vehicleCount = 0 } = useQuery({
    queryKey: ["vehicleStatusCount", status.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("vehicles")
        .select("*", { count: 'exact', head: true })
        .eq("status", status.name);

      if (error) throw error;
      return count || 0;
    },
  });

  return (
    <TableRow key={status.id}>
      <TableCell>
        {editingId === status.id ? (
          <div className="flex gap-2">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-[200px]"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={async () => {
                await onUpdate(status.id, editValue);
                setEditingId(null);
              }}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setEditingId(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          status.name
        )}
      </TableCell>
      <TableCell>{vehicleCount} vehicles</TableCell>
      <TableCell>
        <Button
          variant={status.is_active ? "default" : "secondary"}
          onClick={() => onToggle(status.id, status.is_active)}
        >
          {status.is_active ? "Active" : "Inactive"}
        </Button>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setEditingId(status.id);
            setEditValue(status.name);
          }}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};