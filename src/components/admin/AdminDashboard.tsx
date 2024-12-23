import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemHealth } from "./SystemHealth";
import { UserManagement } from "./UserManagement";
import { AuditLogViewer } from "../audit/AuditLogViewer";
import { FinanceAIAssistant } from "../finance/FinanceAIAssistant";
import { RecentTransactions } from "../finance/RecentTransactions";
import { Loader2, Shield, Users, FileText, DollarSign } from "lucide-react";

export const AdminDashboard = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return profile;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Shield className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You need administrator privileges to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="system" className="space-y-6">
        <TabsList>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            System Health
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <SystemHealth />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <AuditLogViewer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance">
          <div className="grid gap-6">
            <FinanceAIAssistant />
            <RecentTransactions />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};