import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTemplateDialog } from "./CreateTemplateDialog";
import { TemplateList } from "./TemplateList";
import { toast } from "sonner";

export const AgreementTemplateManagement = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ["agreement-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agreement_templates")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handlePreview = (template: any) => {
    // TODO: Implement preview functionality
    toast.info("Preview functionality coming soon");
  };

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setShowCreateDialog(true);
  };

  const handleDelete = async (template: any) => {
    try {
      const { error } = await supabase
        .from("agreement_templates")
        .update({ is_active: false })
        .eq("id", template.id);

      if (error) throw error;
      
      toast.success("Template deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Agreement Templates</CardTitle>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </CardHeader>
      <CardContent>
        <TemplateList 
          templates={templates || []} 
          isLoading={isLoading}
          onPreview={handlePreview}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </CardContent>

      <CreateTemplateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        template={selectedTemplate}
        onClose={() => {
          setSelectedTemplate(null);
          refetch();
        }}
      />
    </Card>
  );
};