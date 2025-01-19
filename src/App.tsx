import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { routes } from "@/routes/routes";
import { SidebarProvider } from "@/components/ui/sidebar/context";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <SidebarProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {routes}
            </Routes>
          </Suspense>
          <Toaster />
        </SidebarProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;