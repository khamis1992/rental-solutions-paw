
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { TooltipProvider } from '@/components/ui/tooltip';
import App from './App.tsx';
import './index.css';

// Create root element once
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

// Configure query client with optimized caching settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // Data remains fresh for 15 minutes
      gcTime: 1000 * 60 * 30, // Cache is garbage collected after 30 minutes
      retry: 1, // Only retry failed requests once
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      networkMode: 'offlineFirst',
    },
  },
});

root.render(
  <React.StrictMode>
    <TooltipProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <SessionContextProvider supabaseClient={supabase}>
              <App />
            </SessionContextProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </React.StrictMode>
);

