import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LegalCaseFormData {
  customer_id: string;
  case_type: string;
  amount_owed: string;
  description: string;
  priority: string;
}

export function useLegalCaseForm(onSuccess: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm<LegalCaseFormData>({
    defaultValues: {
      customer_id: "",
      case_type: "",
      amount_owed: "",
      description: "",
      priority: "medium",
    },
  });

  const onSubmit = async (values: LegalCaseFormData) => {
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
      onSuccess();
    } catch (error) {
      console.error("Error creating legal case:", error);
      toast.error("Failed to create legal case");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    onSubmit: form.handleSubmit(onSubmit),
  };
}