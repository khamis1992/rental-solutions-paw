import { useState, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { CustomerFormFields } from "./CustomerFormFields";
import { DocumentScanner } from "./DocumentScanner";

interface CreateCustomerDialogProps {
  children?: ReactNode;
}

export const CreateCustomerDialog = ({ children }: CreateCustomerDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      full_name: "",
      phone_number: "",
      address: "",
      driver_license: "",
      id_document_url: "",
      license_document_url: "",
      contract_document_url: "",
    },
  });

  const handleScanComplete = (extractedData: any) => {
    form.setValue('full_name', extractedData.full_name);
    form.setValue('driver_license', extractedData.id_number);
  };

  const onSubmit = async (values: any) => {
    console.log("Submitting form with values:", values);
    setIsLoading(true);
    try {
      const newCustomerId = crypto.randomUUID();
      setCustomerId(newCustomerId);

      const { error } = await supabase
        .from("profiles")
        .insert({
          id: newCustomerId,
          ...values,
          role: "customer",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error creating customer:", error);
        throw error;
      }

      toast.success("Customer created successfully");
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      
      // Reset form and close dialog if we're not waiting for document scan
      if (!customerId) {
        form.reset();
        setOpen(false);
      }
    } catch (error: any) {
      console.error("Error in onSubmit:", error);
      toast.error(error.message || "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to the system. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {customerId && (
              <DocumentScanner
                customerId={customerId}
                onScanComplete={handleScanComplete}
              />
            )}
            <CustomerFormFields form={form} />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Customer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};