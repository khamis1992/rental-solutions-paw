import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Customers from "@/pages/Customers";
import Vehicles from "@/pages/Vehicles";
import Agreements from "@/pages/Agreements";
import Maintenance from "@/pages/Maintenance";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import CustomerProfile from "@/pages/CustomerProfile";
import Legal from "@/pages/Legal";
import { VehicleDetails } from "@/components/vehicles/VehicleDetails";
import { useParams } from "react-router-dom";

// Wrapper component to handle URL parameters
const VehicleDetailsWrapper = () => {
  const { id } = useParams();
  if (!id) return <div>Vehicle ID not found</div>;
  return <VehicleDetails vehicleId={id} />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/customers/:id" element={<CustomerProfile />} />
      <Route path="/vehicles" element={<Vehicles />} />
      <Route path="/vehicles/:id" element={<VehicleDetailsWrapper />} />
      <Route path="/agreements" element={<Agreements />} />
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/help" element={<Help />} />
      <Route path="/legal" element={<Legal />} />
    </Routes>
  );
}

export default App;