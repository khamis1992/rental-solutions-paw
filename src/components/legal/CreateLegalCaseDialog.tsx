import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { CaseBasicInfo } from "./case-form/CaseBasicInfo";
import { CaseFinancialInfo } from "./case-form/CaseFinancialInfo";
import { CasePrioritySelect } from "./case-form/CasePrioritySelect";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CreateLegalCaseDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      customer_id: "",
      case_type: "",
      amount_owed: "",
      description: "",
      priority: "medium",
    },
  });

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("legal_cases")
        .insert([{
          ...values,
          amount_owed: parseFloat(values.amount_owed),
          status: "pending_reminder",
        }]);

      if (error) throw error;

      toast.success("Legal case created successfully");
      queryClient.invalidateQueries({ queryKey: ["legal-cases"] });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating legal case:", error);
      toast.error("Failed to create legal case");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Create Case
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create New Legal Case</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-full max-h-[calc(90vh-8rem)] pr-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <CaseBasicInfo form={form} />
                <CaseFinancialInfo form={form} />
                <CasePrioritySelect form={form} />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    Create Case
                  </Button>
                </div>
              </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}