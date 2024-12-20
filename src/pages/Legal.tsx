import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NonCompliantCustomers } from "@/components/legal/NonCompliantCustomers";

export default function Legal() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Legal Management</h1>
        </div>
        <NonCompliantCustomers />
      </div>
    </DashboardLayout>
  );
}