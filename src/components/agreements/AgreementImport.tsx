import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type LeaseStatus = Database["public"]["Enums"]["lease_status"];

export const AgreementImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const parseCSV = (content: string) => {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {} as Record<string, string>);
    });
  };

  const normalizeStatus = (status: string): LeaseStatus => {
    if (!status) return 'pending';
    const statusMap: Record<string, LeaseStatus> = {
      'open': 'open',
      'active': 'active',
      'closed': 'closed',
      'cancelled': 'cancelled',
      'pending': 'pending'
    };
    return statusMap[status.toLowerCase().trim()] || 'pending';
  };

  const parseDate = (dateStr: string): string | null => {
    if (!dateStr) return null;
    try {
      const [day, month, year] = dateStr.split('/').map(Number);
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Date parsing error:', error);
      return null;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast({
        title: "Error",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // Read file content
      const content = await file.text();
      const agreements = parseCSV(content);
      const totalAgreements = agreements.length;
      let processedCount = 0;

      // Process agreements in batches
      const batchSize = 10;
      for (let i = 0; i < agreements.length; i += batchSize) {
        const batch = agreements.slice(i, i + batchSize);
        
        // Process each agreement in the batch
        for (const agreement of batch) {
          // First, get or create customer
          let customerId: string | null = null;
          const { data: existingCustomer } = await supabase
            .from('profiles')
            .select('id')
            .eq('full_name', agreement['full_name'])
            .single();

          if (existingCustomer) {
            customerId = existingCustomer.id;
          } else {
            // Generate a new UUID for the customer
            const newCustomerId = crypto.randomUUID();
            const { data: newCustomer, error: customerError } = await supabase
              .from('profiles')
              .insert({
                id: newCustomerId,
                full_name: agreement['full_name'] || `Unknown Customer ${Date.now()}`,
                role: 'customer'
              })
              .select()
              .single();
            
            if (customerError) throw customerError;
            customerId = newCustomer?.id || null;
          }

          // Get first available vehicle
          const { data: vehicle } = await supabase
            .from('vehicles')
            .select('id')
            .eq('status', 'available')
            .limit(1)
            .single();

          if (!customerId || !vehicle?.id) {
            console.error('Missing customer ID or vehicle ID');
            continue;
          }

          // Create agreement
          const status = normalizeStatus(agreement['STATUS']);
          await supabase
            .from('leases')
            .insert({
              agreement_number: agreement['Agreement Number'] || `AGR${Date.now()}`,
              license_no: agreement['License No'],
              license_number: agreement['License Number'],
              checkout_date: parseDate(agreement['Check-out Date']),
              checkin_date: parseDate(agreement['Check-in Date']),
              return_date: parseDate(agreement['Return Date']),
              status: status,
              customer_id: customerId,
              vehicle_id: vehicle.id,
              total_amount: 0,
              initial_mileage: 0
            });

          processedCount++;
          setProgress((processedCount / totalAgreements) * 100);
        }
      }

      toast({
        title: "Success",
        description: `Successfully imported ${processedCount} agreements`,
      });
      
      await queryClient.invalidateQueries({ queryKey: ["agreements"] });
      await queryClient.invalidateQueries({ queryKey: ["agreements-stats"] });
      
    } catch (error: any) {
      console.error('Import process error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to import agreements",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Agreement Number,License No,full_name,License Number,Check-out Date,Check-in Date,Return Date,STATUS\n" +
                      "AGR001,LIC123,John Doe,DL456,27/03/2024,28/03/2024,29/03/2024,active";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'agreement_import_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        <Button
          variant="outline"
          onClick={downloadTemplate}
          disabled={isUploading}
        >
          Download Template
        </Button>
      </div>
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Importing agreements...
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
};