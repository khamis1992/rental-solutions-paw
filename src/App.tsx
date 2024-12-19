import { Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "@/pages/Index";
import Customers from "@/pages/Customers";
import Vehicles from "@/pages/Vehicles";
import Agreements from "@/pages/Agreements";
import Maintenance from "@/pages/Maintenance";
import Settings from "@/pages/Settings";
import Reports from "@/pages/Reports";
import Help from "@/pages/Help";
import Legal from "@/pages/Legal";
import Finance from "@/pages/Finance";
import Auth from "@/pages/Auth";
import CustomerProfile from "@/pages/CustomerProfile";
import { CodeAnalysisDashboard } from "@/components/codeanalysis/CodeAnalysisDashboard";

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Index />} />
        <Route path="customers" element={<Customers />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="agreements" element={<Agreements />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="settings" element={<Settings />} />
        <Route path="reports" element={<Reports />} />
        <Route path="help" element={<Help />} />
        <Route path="legal" element={<Legal />} />
        <Route path="finance" element={<Finance />} />
        <Route path="customer/:id" element={<CustomerProfile />} />
        <Route path="code-analysis" element={<CodeAnalysisDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;