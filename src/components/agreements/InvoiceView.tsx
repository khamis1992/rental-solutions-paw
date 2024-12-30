import { InvoiceData } from "./utils/invoiceUtils";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { injectPrintStyles } from "@/lib/printStyles";
import { format } from "date-fns";

interface InvoiceViewProps {
  data: InvoiceData;
  onPrint?: () => void;
}

export const InvoiceView = ({ data, onPrint }: InvoiceViewProps) => {
  const { data: settings } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    }
    injectPrintStyles();
  };

  return (
    <Card className="p-8 max-w-3xl mx-auto bg-white shadow-lg print:shadow-none print:p-0">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-4">
          {settings?.logo_url && (
            <img
              src={settings.logo_url}
              alt="Company Logo"
              className="h-16 object-contain"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
            <p className="text-gray-600">#{data.invoiceNumber}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint} className="print:hidden">
          <Printer className="h-4 w-4 mr-2" />
          Print Invoice
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-2">Bill To:</h3>
          <p className="text-gray-600">{data.customerName}</p>
          <p className="text-gray-600 whitespace-pre-line">{data.customerAddress}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-600">
            <span className="font-semibold">Date: </span>
            {data.startDate}
          </p>
          {data.dueDate && (
            <p className="text-gray-600">
              <span className="font-semibold">Due Date: </span>
              {data.dueDate}
            </p>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-semibold mb-2">Vehicle Details:</h3>
        <p className="text-gray-600">{data.vehicleDetails}</p>
        <p className="text-gray-600">
          {data.agreementType}: {data.startDate} - {data.endDate}
        </p>
      </div>

      <table className="w-full mb-8">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Description</th>
            <th className="text-right py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="py-2">{item.description}</td>
              <td className="text-right py-2">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.payments && data.payments.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Payment History</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Description</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-right py-2">Method</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.map((payment) => (
                <tr key={payment.id} className="border-b">
                  <td className="py-2">
                    {payment.payment_date 
                      ? format(new Date(payment.payment_date), 'dd/MM/yyyy')
                      : format(new Date(payment.created_at), 'dd/MM/yyyy')}
                  </td>
                  <td className="py-2">{payment.description || '-'}</td>
                  <td className="text-right py-2">{formatCurrency(payment.amount)}</td>
                  <td className="text-right py-2 capitalize">
                    {payment.payment_method?.toLowerCase().replace('_', ' ') || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col items-end space-y-2">
        <div className="flex justify-between w-48">
          <span>Subtotal:</span>
          <span>{formatCurrency(data.subtotal)}</span>
        </div>
        {data.discount > 0 && (
          <div className="flex justify-between w-48 text-green-600">
            <span>Discount:</span>
            <span>-{formatCurrency(data.discount)}</span>
          </div>
        )}
        <div className="flex justify-between w-48 font-bold text-lg">
          <span>Total:</span>
          <span>{formatCurrency(data.total)}</span>
        </div>
        {data.payments && (
          <div className="flex justify-between w-48 text-blue-600">
            <span>Total Paid:</span>
            <span>{formatCurrency(data.payments.reduce((sum, p) => sum + p.amount, 0))}</span>
          </div>
        )}
      </div>
    </Card>
  );
};