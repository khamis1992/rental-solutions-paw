import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Agreements from "@/pages/Agreements";
import CustomerProfile from "@/pages/CustomerProfile";
import Customers from "@/pages/Customers";
import TrafficFines from "./pages/TrafficFines";

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Agreements />} />
        <Route path="/agreements" element={<Agreements />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customer/:id" element={<CustomerProfile />} />
        <Route path="/traffic-fines" element={<TrafficFines />} />
      </Route>
    </Routes>
  );
}