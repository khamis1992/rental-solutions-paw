import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TemplateList } from "./TemplateList";
import { CreateTemplateDialog } from "./CreateTemplateDialog";

export const LegalDocumentTemplates = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: templates, isLoading } = useQuery({
    queryKey: ["legal-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_document_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Legal Document Templates</CardTitle>
          <CardDescription>
            Manage and customize legal document templates
          </CardDescription>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </CardHeader>
      <CardContent>
        <TemplateList templates={templates || []} isLoading={isLoading} />
      </CardContent>

      <CreateTemplateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </Card>
  );
};