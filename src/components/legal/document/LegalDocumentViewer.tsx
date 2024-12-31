import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { DocumentClassifier } from "./DocumentClassifier";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LegalDocumentViewerProps {
  documentId: string;
}

interface LegalDocument {
  id: string;
  case_id: string;
  template_id: string;
  content: string;
  language: "english" | "spanish" | "french" | "arabic";
  generated_by: string;
  expiry_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  document_type?: string;
}

export function LegalDocumentViewer({ documentId }: LegalDocumentViewerProps) {
  const { data: document, isLoading } = useQuery({
    queryKey: ['legal-document', documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;
      return data as LegalDocument;
    }
  });

  const { data: classification } = useQuery({
    queryKey: ['document-classification', documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_document_classification')
        .select('*')
        .eq('document_id', documentId)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!document) {
    return <div>Document not found</div>;
  }

  // Use document_type if available, otherwise 'unspecified'
  const documentType = document.document_type || 'unspecified';

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <div className="prose max-w-none dark:prose-invert">
            {document.content}
          </div>
        </div>
      </Card>

      {classification && (
        <Card>
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Classification:</span>
              <Badge variant="outline" className="capitalize">
                {classification.classification_type}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Confidence:</span>
              <Badge 
                variant={classification.confidence_score > 0.8 ? "success" : "warning"}
              >
                {Math.round(classification.confidence_score * 100)}%
              </Badge>
            </div>
          </div>
        </Card>
      )}

      <DocumentClassifier
        documentId={document.id}
        documentContent={document.content}
        documentType={documentType}
      />
    </div>
  );
}