import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Agreements from "@/pages/Agreements";
import CustomerProfile from "@/pages/CustomerProfile";
import Customers from "@/pages/Customers";
import TrafficFines from "./pages/TrafficFines"; // Add this import at the top with other page imports

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="agreements" element={<Agreements />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customer/:id" element={<CustomerProfile />} />
          <Route path="/traffic-fines" element={<TrafficFines />} /> {/* Add this route in the router configuration */}
        </Route>
      </Routes>
    </Router>
  );
}
