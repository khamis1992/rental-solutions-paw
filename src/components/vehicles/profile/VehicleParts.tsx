import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Wrench } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface VehiclePartsProps {
  vehicleId: string;
}

export const VehicleParts = ({ vehicleId }: VehiclePartsProps) => {
  const [newPart, setNewPart] = useState({
    part_name: "",
    part_number: "",
    quantity: 1,
    unit_cost: 0,
    supplier: "",
  });
  const queryClient = useQueryClient();

  const { data: parts, isLoading } = useQuery({
    queryKey: ["vehicle-parts", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_parts")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleAddPart = async () => {
    try {
      const { error } = await supabase
        .from("vehicle_parts")
        .insert({
          ...newPart,
          vehicle_id: vehicleId,
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["vehicle-parts", vehicleId] });
      toast.success("Part added successfully");
      setNewPart({
        part_name: "",
        part_number: "",
        quantity: 1,
        unit_cost: 0,
        supplier: "",
      });
    } catch (error) {
      console.error("Error adding part:", error);
      toast.error("Failed to add part");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Vehicle Parts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-5 gap-4">
          <div>
            <Label htmlFor="part_name">Part Name</Label>
            <Input
              id="part_name"
              value={newPart.part_name}
              onChange={(e) =>
                setNewPart({ ...newPart, part_name: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="part_number">Part Number</Label>
            <Input
              id="part_number"
              value={newPart.part_number}
              onChange={(e) =>
                setNewPart({ ...newPart, part_number: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={newPart.quantity}
              onChange={(e) =>
                setNewPart({ ...newPart, quantity: parseInt(e.target.value) })
              }
            />
          </div>
          <div>
            <Label htmlFor="unit_cost">Unit Cost</Label>
            <Input
              id="unit_cost"
              type="number"
              value={newPart.unit_cost}
              onChange={(e) =>
                setNewPart({ ...newPart, unit_cost: parseFloat(e.target.value) })
              }
            />
          </div>
          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={newPart.supplier}
              onChange={(e) =>
                setNewPart({ ...newPart, supplier: e.target.value })
              }
            />
          </div>
        </div>
        <Button onClick={handleAddPart} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Part
        </Button>

        {isLoading ? (
          <div>Loading parts...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Name</TableHead>
                <TableHead>Part Number</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts?.map((part) => (
                <TableRow key={part.id}>
                  <TableCell>{part.part_name}</TableCell>
                  <TableCell>{part.part_number}</TableCell>
                  <TableCell>{part.quantity}</TableCell>
                  <TableCell>${part.unit_cost}</TableCell>
                  <TableCell>{part.supplier}</TableCell>
                  <TableCell>{part.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};