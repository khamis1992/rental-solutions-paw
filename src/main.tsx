import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { supabase } from '@/integrations/supabase/client';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      networkMode: 'offlineFirst',
    },
  },
});

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <SessionContextProvider 
        supabaseClient={supabase}
        initialSession={null}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SidebarProvider>
              <App />
            </SidebarProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </SessionContextProvider>
    </ErrorBoundary>
  </React.StrictMode>
);