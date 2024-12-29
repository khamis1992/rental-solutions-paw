import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ManualTrafficFineDialogProps {
  onFineAdded: () => void;
}

export function ManualTrafficFineDialog({ onFineAdded }: ManualTrafficFineDialogProps) {
  const [fineData, setFineData] = useState({
    violationNumber: '',
    violationDate: '',
    licensePlate: '',
    fineAmount: 0,
    fineType: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFineData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('traffic_fines')
        .insert([fineData]);

      if (error) throw error;
      toast.success("Traffic fine added successfully");
      onFineAdded();
    } catch (error) {
      console.error('Error adding traffic fine:', error);
      toast.error("Failed to add traffic fine");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button id="add-fine-dialog" size="sm" className="hidden">
          <Plus className="h-4 w-4 mr-2" />
          Add Fine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Traffic Fine</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="violationNumber"
            placeholder="Violation Number"
            value={fineData.violationNumber}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="date"
            name="violationDate"
            value={fineData.violationDate}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="licensePlate"
            placeholder="License Plate"
            value={fineData.licensePlate}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            name="fineAmount"
            placeholder="Fine Amount"
            value={fineData.fineAmount}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
          <select
            name="fineType"
            value={fineData.fineType}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select Fine Type</option>
            <option value="speeding">Speeding</option>
            <option value="parking">Parking</option>
            <option value="red_light">Red Light</option>
            <option value="other">Other</option>
          </select>
          <div className="flex justify-end">
            <Button type="submit">Add Fine</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
