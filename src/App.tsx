import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import * as LazyComponents from "@/routes/routes";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="rental-solutions-theme">
      <div className="min-h-screen bg-background">
        <Toaster />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/auth"
            element={
              <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
                <LazyComponents.Auth />
              </Suspense>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LazyComponents.Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}