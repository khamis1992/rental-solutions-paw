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

interface AgreementTemplate {
  id: string;
  name: string;
  agreement_type: "lease_to_own" | "short_term";
  rent_amount: number;
  final_price: number;
  agreement_duration: string;
  daily_late_fee: number;
  damage_penalty_rate: number;
  late_return_fee: number;
}

interface AgreementTemplateSelectProps {
  setValue: UseFormSetValue<AgreementFormData>;
}

export const AgreementTemplateSelect = ({ setValue }: AgreementTemplateSelectProps) => {
  const { data: templates } = useQuery({
    queryKey: ["agreement-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agreement_templates")
        .select("*")
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching templates:", error);
        throw error;
      }
      
      return data as AgreementTemplate[];
    },
  });

  const handleTemplateSelect = (templateId: string) => {
    const selectedTemplate = templates?.find((t) => t.id === templateId);
    if (!selectedTemplate) return;

    // Convert agreement duration from interval to months
    const durationMatch = selectedTemplate.agreement_duration.match(/(\d+) months?/);
    const durationMonths = durationMatch ? parseInt(durationMatch[1]) : 12;

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

  if (!templates?.length) {
    console.log("No templates found");
    return null;
  }

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