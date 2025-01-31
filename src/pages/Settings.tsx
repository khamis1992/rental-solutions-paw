import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { IntegrationSettings } from "@/components/settings/IntegrationSettings";
import { UserManagementSettings } from "@/components/settings/UserManagementSettings";
import { VehicleStatusSettings } from "@/components/settings/VehicleStatusSettings";
import { AgreementTemplateManagement } from "@/components/agreements/templates/AgreementTemplateManagement";
import { ScrollArea } from "@/components/ui/scroll-area";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-[1600px] mx-auto px-4 py-6">
        <div className="bg-background/60 backdrop-blur-sm sticky top-0 z-10 pb-4">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your application settings and preferences
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <ScrollArea className="w-full border-b">
            <TabsList className="w-full justify-start p-1 h-auto flex-wrap">
              <TabsTrigger value="general" className="py-2.5">General</TabsTrigger>
              <TabsTrigger value="notifications" className="py-2.5">Notifications</TabsTrigger>
              <TabsTrigger value="billing" className="py-2.5">Billing & Payments</TabsTrigger>
              <TabsTrigger value="security" className="py-2.5">Security</TabsTrigger>
              <TabsTrigger value="integrations" className="py-2.5">Integrations</TabsTrigger>
              <TabsTrigger value="users" className="py-2.5">Users</TabsTrigger>
              <TabsTrigger value="vehicle-status" className="py-2.5">Vehicle Status</TabsTrigger>
              <TabsTrigger value="templates" className="py-2.5">Templates</TabsTrigger>
            </TabsList>
          </ScrollArea>

          <div className="mt-6">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-8 pb-8 px-2">
                <TabsContent value="general">
                  <GeneralSettings />
                </TabsContent>
                <TabsContent value="notifications">
                  <NotificationSettings />
                </TabsContent>
                <TabsContent value="billing">
                  <BillingSettings />
                </TabsContent>
                <TabsContent value="security">
                  <SecuritySettings />
                </TabsContent>
                <TabsContent value="integrations">
                  <IntegrationSettings />
                </TabsContent>
                <TabsContent value="users">
                  <UserManagementSettings />
                </TabsContent>
                <TabsContent value="vehicle-status">
                  <VehicleStatusSettings />
                </TabsContent>
                <TabsContent value="templates">
                  <AgreementTemplateManagement />
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;