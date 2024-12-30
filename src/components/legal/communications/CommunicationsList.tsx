import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { NewCommunicationDialog } from "./NewCommunicationDialog";
import { useState } from "react";

interface CommunicationsListProps {
  caseId: string;
}

export const CommunicationsList = ({ caseId }: CommunicationsListProps) => {
  const [showNewDialog, setShowNewDialog] = useState(false);

  const { data: communications, isLoading } = useQuery({
    queryKey: ["legal-communications", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_communications")
        .select("*")
        .eq("case_id", caseId)
        .order("sent_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      delivered: "default",
      pending: "secondary",
      failed: "destructive",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return <div>Loading communications...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Communications</CardTitle>
        <Button onClick={() => setShowNewDialog(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Communication
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {communications?.map((comm) => (
            <div
              key={comm.id}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getTypeIcon(comm.type)}</div>
                <div>
                  <p className="font-medium">{comm.type}</p>
                  <p className="text-sm text-muted-foreground">{comm.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {comm.sent_date ? format(new Date(comm.sent_date), "PPp") : "Not sent"}
                  </p>
                </div>
              </div>
              <div>{getStatusBadge(comm.delivery_status)}</div>
            </div>
          ))}
          {!communications?.length && (
            <p className="text-center text-muted-foreground py-4">
              No communications found
            </p>
          )}
        </div>
      </CardContent>

      <NewCommunicationDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        caseId={caseId}
      />
    </Card>
  );
};