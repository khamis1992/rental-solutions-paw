import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import Vehicles from "./pages/Vehicles";
import Maintenance from "./pages/Maintenance";
import Customers from "./pages/Customers";
import Agreements from "./pages/Agreements";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Help from "./pages/Help";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/agreements" element={<Agreements />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/help" element={<Help />} />
              </Routes>
              <Toaster />
              <Sonner />
            </div>
          </SidebarProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;