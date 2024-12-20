import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "@/pages/Index";
import Agreements from "@/pages/Agreements";
import CustomerProfile from "@/pages/CustomerProfile";
import Customers from "@/pages/Customers";
import Finance from "@/pages/Finance";
import Help from "@/pages/Help";
import Legal from "@/pages/Legal";
import Maintenance from "@/pages/Maintenance";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import TrafficFines from "@/pages/TrafficFines";
import Vehicles from "@/pages/Vehicles";

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="/agreements" element={<Agreements />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customer/:id" element={<CustomerProfile />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/help" element={<Help />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/traffic-fines" element={<TrafficFines />} />
        <Route path="/vehicles" element={<Vehicles />} />
      </Route>
    </Routes>
  );
}