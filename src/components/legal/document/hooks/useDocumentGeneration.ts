import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GenerateDocumentParams {
  templateId: string;
  variables: Record<string, string | number>;
  caseId?: string;
}

export function useDocumentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDocument = async ({ templateId, variables, caseId }: GenerateDocumentParams) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-legal-document', {
        body: { templateId, variables, caseId }
      });

      if (error) throw error;

      toast.success('Document generated successfully');
      return data;
    } catch (error: any) {
      console.error('Error generating document:', error);
      toast.error(error.message || 'Failed to generate document');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateDocument,
    isGenerating
  };
}