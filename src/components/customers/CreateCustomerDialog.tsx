import { useState, ReactNode } from "react";
import { useForm } from "react-hook-form";
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
import { EnhancedButton } from "@/components/ui/enhanced-button";

interface CreateCustomerDialogProps {
  children?: ReactNode;
}

export const CreateCustomerDialog = ({ children }: CreateCustomerDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
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
    console.log("Scan complete with data:", extractedData);
    form.setValue('full_name', extractedData.full_name);
    form.setValue('driver_license', extractedData.id_number);
  };

  const onSubmit = async (values: any) => {
    console.log("Submitting form with values:", values);
    setIsLoading(true);
    setSuccess(false);
    setError(false);
    
    try {
      // Generate a new UUID for the customer if not already set
      const newCustomerId = customerId || crypto.randomUUID();
      
      // Prepare the customer data
      const customerData = {
        id: newCustomerId,
        ...values,
        role: "customer",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'pending_review',
      };

      console.log("Inserting customer with data:", customerData);

      const { error: supabaseError } = await supabase
        .from("profiles")
        .insert(customerData);

      if (supabaseError) {
        console.error("Supabase error:", supabaseError);
        throw supabaseError;
      }

      setSuccess(true);
      toast.success("Customer created successfully");
      
      // Invalidate and refetch customers query
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      
      // Reset form and close dialog after success animation
      setTimeout(() => {
        form.reset();
        setOpen(false);
        setCustomerId(null);
      }, 1500);
      
    } catch (error: any) {
      console.error("Error in onSubmit:", error);
      setError(true);
      toast.error(error.message || "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <EnhancedButton>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </EnhancedButton>
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
            {!customerId && (
              <DocumentScanner
                customerId={crypto.randomUUID()}
                onScanComplete={handleScanComplete}
              />
            )}
            <CustomerFormFields form={form} />
            <DialogFooter>
              <EnhancedButton
                type="submit"
                loading={isLoading}
                success={success}
                error={error}
                loadingText="Creating..."
                successText="Customer Created!"
                errorText="Failed to Create"
              >
                Create Customer
              </EnhancedButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};