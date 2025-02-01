import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { FileText, Printer, Trash2 } from "lucide-react";
import type { Agreement } from "@/types/agreement.types";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
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

export interface AgreementTableRowProps {
  agreement: Agreement;
  onAgreementClick: (id: string) => void;
  onNameClick: (id: string) => void;
  onDeleted?: () => void;
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

  const handleDownloadTemplate = async () => {
    try {
      setDownloading(true);
      const { data: agreement_data, error: agreementError } = await supabase
        .from('leases')
        .select(`
          *,
          agreement_templates!leases_template_id_fkey (
            content,
            language
          ),
          customer:customer_id (
            full_name,
            phone_number,
            email,
            address,
            nationality,
            driver_license
          ),
          vehicle:vehicle_id (
            make,
            model,
            year,
            color,
            license_plate,
            vin
          )
        `)
        .eq('id', agreement.id)
        .maybeSingle();

      if (agreementError) throw agreementError;

      if (!agreement_data?.agreement_templates?.content) {
        toast.error('No template found for this agreement');
        return;
      }

      let templateContent = agreement_data.agreement_templates.content;
      const isRTL = agreement_data.agreement_templates.language === 'arabic';

      // Replace variables
      templateContent = templateContent
        .replace(/{{agreement\.start_date}}/g, formatDateToDisplay(agreement_data.start_date))
        .replace(/{{agreement\.end_date}}/g, formatDateToDisplay(agreement_data.end_date))
        .replace(/{{agreement\.agreement_number}}/g, agreement_data.agreement_number || '')
        .replace(/{{agreement\.rent_amount}}/g, `${agreement_data.rent_amount} QAR`)
        .replace(/{{agreement\.daily_late_fee}}/g, `${agreement_data.daily_late_fee} QAR`)
        .replace(/{{agreement\.agreement_duration}}/g, agreement_data.agreement_duration || '')
        .replace(/{{agreement\.total_amount}}/g, `${agreement_data.total_amount} QAR`)
        .replace(/{{agreement\.down_payment}}/g, agreement_data.down_payment ? `${agreement_data.down_payment} QAR` : '0 QAR')
        .replace(/{{payment\.down_payment}}/g, agreement_data.down_payment ? `${agreement_data.down_payment} QAR` : '0 QAR');

      // Replace customer variables
      if (agreement_data.customer) {
        templateContent = templateContent
          .replace(/{{customer\.name}}/g, agreement_data.customer.full_name || '')
          .replace(/{{customer\.full_name}}/g, agreement_data.customer.full_name || '')
          .replace(/{{customer\.phone_number}}/g, agreement_data.customer.phone_number || '')
          .replace(/{{customer\.email}}/g, agreement_data.customer.email || '')
          .replace(/{{customer\.address}}/g, agreement_data.customer.address || '')
          .replace(/{{customer\.nationality}}/g, agreement_data.customer.nationality || '')
          .replace(/{{customer\.driver_license}}/g, agreement_data.customer.driver_license || '');
      }

      // Replace vehicle variables
      if (agreement_data.vehicle) {
        const vehicleName = `${agreement_data.vehicle.make} ${agreement_data.vehicle.model}`;
        templateContent = templateContent
          .replace(/{{vehicle\.name}}/g, vehicleName)
          .replace(/{{vehicle\.make}}/g, agreement_data.vehicle.make || '')
          .replace(/{{vehicle\.model}}/g, agreement_data.vehicle.model || '')
          .replace(/{{vehicle\.year}}/g, agreement_data.vehicle.year?.toString() || '')
          .replace(/{{vehicle\.color}}/g, agreement_data.vehicle.color || '')
          .replace(/{{vehicle\.license_plate}}/g, agreement_data.vehicle.license_plate || '')
          .replace(/{{vehicle\.vin}}/g, agreement_data.vehicle.vin || '');
      }

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${isRTL ? 'ar' : 'en'}">
          <head>
            <meta charset="UTF-8">
            <style>
              @page {
                size: A4;
                margin: 20mm;
                marks: crop cross;
              }
              body {
                font-family: ${isRTL ? 'Arial, Noto Sans Arabic' : 'Arial'}, sans-serif;
                direction: ${isRTL ? 'rtl' : 'ltr'};
                text-align: ${isRTL ? 'right' : 'left'};
                line-height: 1.5;
                margin: 0;
                padding: 20mm;
                width: 170mm;
                min-height: 257mm;
                background: white;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 1em 0;
              }
              td, th {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: ${isRTL ? 'right' : 'left'};
              }
            </style>
          </head>
          <body>
            ${templateContent}
          </body>
        </html>
      `;

      // Convert HTML to PDF using browser's print to PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups and try again.');
        return;
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <TableRow className="hover:bg-muted/50">
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
      <TableCell>{`${agreement.vehicle?.make} ${agreement.vehicle?.model}`}</TableCell>
      <TableCell>
        <span className="font-medium">{agreement.customer?.full_name}</span>
      </TableCell>
      <TableCell>{formatDateToDisplay(agreement.start_date)}</TableCell>
      <TableCell>{formatDateToDisplay(agreement.end_date)}</TableCell>
      <TableCell>
        <Badge 
          variant="outline" 
          className="capitalize"
        >
          {agreement.status}
        </Badge>
      </TableCell>
      <TableCell>
        <PaymentStatusBadge status={agreement.remaining_amount > 0 ? 'pending' : 'completed'} />
      </TableCell>
      
      <TableCell className="text-right space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAgreementClick(agreement.id)}
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
                onClick={handleDownloadTemplate}
                disabled={downloading}
              >
                <Printer className="h-4 w-4 text-green-600 hover:text-green-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Print Agreement</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
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
      </TableCell>
    </TableRow>
  );
};