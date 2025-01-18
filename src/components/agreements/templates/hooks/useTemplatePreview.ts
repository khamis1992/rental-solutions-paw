import { useState } from "react";
import { replaceTemplateVariables, validateTemplate } from "../utils/templateUtils";
import { Agreement, AgreementWithRelations } from "@/types/database/agreement.types";
import { Vehicle } from "@/types/vehicle";
import { Customer } from "@/types/customer";

interface UseTemplatePreviewProps {
  template: string;
}

export const useTemplatePreview = ({ template }: UseTemplatePreviewProps) => {
  const [previewData, setPreviewData] = useState<string>("");
  const [missingVariables, setMissingVariables] = useState<string[]>([]);

  const generatePreview = (data: {
    agreement: AgreementWithRelations;
    vehicle?: Vehicle;
    customer?: Customer;
  }) => {
    // Validate template first
    const missing = validateTemplate(template);
    setMissingVariables(missing);

    // Generate preview
    const preview = replaceTemplateVariables(template, data);
    setPreviewData(preview);

    return preview;
  };

  return {
    previewData,
    missingVariables,
    generatePreview,
  };
};