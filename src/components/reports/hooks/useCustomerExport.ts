import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerExport = () => {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name,phone_number,address,driver_license,role")
        .eq("role", "customer");

      if (error) throw error;

      const headers = ["Full Name,Phone Number,Address,Driver License,Role"];
      const csvData = data.map(row => 
        Object.values(row).join(",")
      );
      
      const csv = [...headers, ...csvData].join("\n");
      
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `customers-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    const headers = ["Full Name,Phone Number,Address,Driver License"];
    const sampleData = [
      "John Doe,+974 1234 5678,123 Main St Doha,DL123456",
      "Jane Smith,+974 2345 6789,456 Park Ave Doha,DL234567"
    ];
    
    const csv = [...headers, ...sampleData].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "customer-import-template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return {
    handleExport,
    downloadTemplate
  };
};