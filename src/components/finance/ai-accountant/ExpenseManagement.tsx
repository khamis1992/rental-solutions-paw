import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Upload, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const ExpenseManagement = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_transactions")
        .select(`
          *,
          category:expense_categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFile(file);
  };

  const processReceipt = async () => {
    if (!file) return;
    setIsUploading(true);

    try {
      // Upload receipt to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Process receipt with AI
      const { data: aiAnalysis, error: analysisError } = await supabase.functions
        .invoke('analyze-receipt', {
          body: { filePath },
        });

      if (analysisError) throw analysisError;

      toast.success('Receipt processed successfully');
    } catch (error) {
      console.error('Error processing receipt:', error);
      toast.error('Failed to process receipt');
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expenses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="upload">Upload Receipt</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4">
            <div className="grid gap-4">
              {expenses?.map((expense) => (
                <div
                  key={expense.id}
                  className="flex justify-between items-center p-4 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {expense.category?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(expense.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(expense.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-lg">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="max-w-xs"
              />
              {file && (
                <Button
                  onClick={processReceipt}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Process Receipt'
                  )}
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};