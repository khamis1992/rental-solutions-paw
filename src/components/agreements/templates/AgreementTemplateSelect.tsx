import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UseFormSetValue } from "react-hook-form";
import { AgreementFormData } from "../hooks/useAgreementForm";
import { Template } from "@/types/agreement.types";

interface AgreementTemplateSelectProps {
  setValue: UseFormSetValue<AgreementFormData>;
}

export const AgreementTemplateSelect = ({ setValue }: AgreementTemplateSelectProps) => {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["agreement-templates"],
    queryFn: async () => {
      console.log("Fetching templates...");
      const { data, error } = await supabase
        .from("agreement_templates")
        .select("*")
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching templates:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("No templates found in database");
        return [];
      }

      // Transform the data to match Template interface
      const transformedData: Template[] = data.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description || "",
        content: template.content || "",
        language: template.language || "english",
        agreement_type: template.agreement_type,
        rent_amount: template.rent_amount,
        final_price: template.final_price,
        agreement_duration: template.agreement_duration || "",
        daily_late_fee: template.daily_late_fee,
        damage_penalty_rate: template.damage_penalty_rate,
        late_return_fee: template.late_return_fee,
        is_active: template.is_active,
        created_at: template.created_at,
        updated_at: template.updated_at,
        template_structure: template.template_structure || {},
        template_sections: template.template_sections || [],
        variable_mappings: template.variable_mappings || {}
      }));
      
      console.log("Fetched templates:", transformedData);
      return transformedData;
    },
  });

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  if (!templates?.length) {
    console.log("No templates available to display");
    return (
      <div className="space-y-2">
        <Label htmlFor="template">Agreement Template</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="No templates available" />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  const handleTemplateSelect = (templateId: string) => {
    const selectedTemplate = templates?.find((t) => t.id === templateId);
    if (!selectedTemplate) {
      console.log("No template found with ID:", templateId);
      return;
    }

    // Parse duration from agreement_duration string
    let durationMonths = 12; // Default value
    try {
      const durationStr = selectedTemplate.agreement_duration;
      if (durationStr.includes("months") || durationStr.includes("month")) {
        const match = durationStr.match(/(\d+)/);
        if (match) {
          const months = parseInt(match[1]);
          if (!isNaN(months)) {
            durationMonths = months;
          }
        }
      }
    } catch (error) {
      console.error("Error parsing duration:", error);
    }

    // Apply template values to form
    setValue("agreementType", selectedTemplate.agreement_type);
    setValue("rentAmount", selectedTemplate.rent_amount);
    setValue("finalPrice", selectedTemplate.final_price);
    setValue("agreementDuration", durationMonths);
    setValue("dailyLateFee", selectedTemplate.daily_late_fee);
    setValue("damagePenaltyRate", selectedTemplate.damage_penalty_rate);
    setValue("lateReturnFee", selectedTemplate.late_return_fee);

    console.log("Applied template values:", selectedTemplate);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="template">Agreement Template</Label>
      <Select onValueChange={handleTemplateSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a template" />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
