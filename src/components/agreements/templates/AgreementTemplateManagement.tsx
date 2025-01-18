import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTemplateDialog } from "./CreateTemplateDialog";
import { TemplateList } from "./TemplateList";
import { toast } from "sonner";
import { Template } from "@/types/agreement.types";

export const AgreementTemplateManagement = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ["agreement-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agreement_templates")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to match Template interface
      const transformedData: Template[] = data.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description || '',
        content: template.content || '',
        language: template.language || 'english',
        agreement_type: template.agreement_type,
        rent_amount: template.rent_amount,
        final_price: template.final_price,
        agreement_duration: template.agreement_duration,
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
      
      return transformedData;
    },
  });

  const handlePreview = (template: Template) => {
    // TODO: Implement preview functionality
    toast.info("Preview functionality coming soon");
  };

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setShowCreateDialog(true);
  };

  const handleDelete = async (template: Template) => {
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
      />
    </Card>
  );
};