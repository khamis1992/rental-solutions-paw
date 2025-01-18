import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTemplateDialog } from "./CreateTemplateDialog";
import { TemplateList } from "./TemplateList";

export const AgreementTemplateManagement = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: templates, isLoading } = useQuery({
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
        <TemplateList templates={templates || []} isLoading={isLoading} />
      </CardContent>

      <CreateTemplateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </Card>
  );
};