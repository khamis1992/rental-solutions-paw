import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { UserManagementSettings } from "@/components/settings/UserManagementSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";

export default function Settings() {
  return (
    <div className="w-full bg-background">
      <div className="pt-[calc(var(--header-height,56px)+2rem)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-secondary">Settings</h1>
          <p className="text-muted-foreground">Manage system settings and preferences</p>
        </div>
        
        <GeneralSettings />
        <UserManagementSettings />
        <NotificationSettings />
      </div>
    </div>
  );
}