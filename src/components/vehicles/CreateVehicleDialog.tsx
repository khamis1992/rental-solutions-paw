import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { VehicleFormFields } from "./form/VehicleFormFields";
import { useVehicleForm } from "./hooks/useVehicleForm";

interface CreateVehicleDialogProps {
  children?: React.ReactNode;
}

export const CreateVehicleDialog = ({ children }: CreateVehicleDialogProps) => {
  const { open, setOpen, form, onSubmit } = useVehicleForm();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Vehicle</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <VehicleFormFields form={form} />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Vehicle</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};