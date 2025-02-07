import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RevenueDashboard } from "@/components/finance/dashboard/RevenueDashboard";
import { PaymentManagement } from "@/components/finance/payments/PaymentManagement";
import { RawDataView } from "@/components/finance/raw-data/RawDataView";
import { CarInstallmentContracts } from "@/components/finance/car-installments/CarInstallmentContracts";
import { CarInstallmentDetails } from "@/components/finance/car-installments/CarInstallmentDetails";
import { VirtualCFO } from "@/components/finance/virtual-cfo/VirtualCFO";
import { Routes, Route, useLocation } from "react-router-dom";
import { FinancialNavigation } from "@/components/finance/navigation/FinancialNavigation";

const Finance = () => {
  const location = useLocation();
  const isCarInstallmentDetails = location.pathname.includes('/car-installments/');

  // Don't show navigation if we're on the details page
  if (isCarInstallmentDetails) {
    return (
      <div className="container mx-auto p-6">
        <Routes>
          <Route path="/car-installments/:id" element={<CarInstallmentDetails />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Financial Management</h1>
        <FinancialNavigation />
        
        <div className="mt-6">
          <Routes>
            <Route index element={<RevenueDashboard />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="raw-data" element={<RawDataView />} />
            <Route path="car-installments" element={<CarInstallmentContracts />} />
            <Route path="car-installments/:id" element={<CarInstallmentDetails />} />
            <Route path="virtual-cfo" element={<VirtualCFO />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Finance;