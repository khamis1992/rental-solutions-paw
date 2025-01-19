import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { routes } from "@/routes/routes";
import { SidebarProvider } from "@/components/ui/sidebar/context";

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <Routes>
          {routes}
        </Routes>
        <Toaster />
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;