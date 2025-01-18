import { useState } from "react";
import { replaceTemplateVariables, validateTemplate } from "../utils/templateUtils";
import { AgreementWithRelations } from "@/types/agreement.types";
import { Vehicle } from "@/types/vehicle";
import { Customer } from "@/types/customer";

interface UseTemplatePreviewProps {
  template: string;
  agreement?: AgreementWithRelations;
  vehicle?: Vehicle;
  customer?: Customer;
}

export const useTemplatePreview = ({ 
  template,
  agreement,
  vehicle,
  customer 
}: UseTemplatePreviewProps) => {
  const [previewContent, setPreviewContent] = useState<string>("");
  const [missingVariables, setMissingVariables] = useState<string[]>([]);

  const generatePreview = () => {
    if (!template || !agreement) return;

    const missing = validateTemplate(template);
    setMissingVariables(missing);

    const preview = replaceTemplateVariables(template, {
      agreement,
      vehicle,
      customer
    });

    setPreviewContent(preview);
  };

  return {
    previewContent,
    missingVariables,
    generatePreview
  };
};