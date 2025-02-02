import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { FileText, Trash2 } from "lucide-react";
import type { Agreement } from "@/types/agreement.types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { DeleteAgreementDialog } from "../DeleteAgreementDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AgreementEditor } from "../print/AgreementEditor";

interface AgreementTableRowProps {
  agreement: Agreement;
  onViewContract: (id: string) => void;
  onPrintContract: (id: string) => void;
  onAgreementClick: (id: string) => void;
  onNameClick: (id: string) => void;
  onDeleted: () => void;
  onDeleteClick: () => void;
}

export const AgreementTableRow = ({
  agreement,
  onAgreementClick,
  onNameClick,
  onDeleted,
  onDeleteClick,
}: AgreementTableRowProps) => {
  const [downloading, setDownloading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateContent, setTemplateContent] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleViewTemplate = async () => {
    try {
      const { data: templateData, error } = await supabase
        .from("agreement_templates")
        .select("content")
        .eq("id", agreement.template_id)
        .single();

      if (error) throw error;

      if (!templateData?.content) {
        toast.error("No template content found");
        return;
      }

      // Replace template variables with actual values
      let content = templateData.content
        .replace(/{{customer\.customer_name}}/g, agreement.customer?.full_name || "")
        .replace(/{{customer\.phone_number}}/g, agreement.customer?.phone_number || "")
        .replace(/{{vehicle\.make}}/g, agreement.vehicle?.make || "")
        .replace(/{{vehicle\.model}}/g, agreement.vehicle?.model || "")
        .replace(/{{vehicle\.year}}/g, agreement.vehicle?.year?.toString() || "")
        .replace(/{{vehicle\.license_plate}}/g, agreement.vehicle?.license_plate || "")
        .replace(/{{agreement\.agreement_number}}/g, agreement.agreement_number || "")
        .replace(/{{agreement\.start_date}}/g, formatDateToDisplay(agreement.start_date))
        .replace(/{{agreement\.end_date}}/g, formatDateToDisplay(agreement.end_date));

      setTemplateContent(content);
      setShowTemplateDialog(true);
    } catch (error) {
      console.error("Error fetching template:", error);
      toast.error("Failed to load template");
    }
  };

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell>
        <button
          onClick={() => onNameClick(agreement.id)}
          className="text-primary hover:underline font-medium"
        >
          {agreement.agreement_number}
        </button>
      </TableCell>
      <TableCell>
        <button
          onClick={() => onNameClick(agreement.id)}
          className="text-primary hover:underline"
        >
          {agreement.vehicle?.license_plate}
        </button>
      </TableCell>
      <TableCell className="font-medium">
        {`${agreement.vehicle?.make} ${agreement.vehicle?.model}`}
      </TableCell>
      <TableCell>
        <span className="font-medium truncate max-w-[200px] block">
          {agreement.customer?.full_name}
        </span>
      </TableCell>
      <TableCell>{formatDateToDisplay(agreement.start_date)}</TableCell>
      <TableCell>{formatDateToDisplay(agreement.end_date)}</TableCell>
      <TableCell>
        <Badge 
          variant="outline" 
          className={`capitalize ${getStatusColor(agreement.status)}`}
        >
          {agreement.status}
        </Badge>
      </TableCell>
      
      <TableCell className="text-right space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewTemplate}
                className="hover:bg-primary/10"
              >
                <FileText className="h-4 w-4 text-primary hover:text-primary/80" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Agreement Template</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4 text-red-600 hover:text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Agreement</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DeleteAgreementDialog
          agreementId={agreement.id}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onDeleted={onDeleted}
        />

        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-4xl">
            <AgreementEditor initialContent={templateContent} />
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
};
