import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { supabase } from '@/integrations/supabase/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Get initial session
const initialSession = await supabase.auth.getSession();

root.render(
  <React.StrictMode>
    <SessionContextProvider 
      supabaseClient={supabase} 
      initialSession={initialSession.data.session}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SidebarProvider>
            <App />
          </SidebarProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </SessionContextProvider>
  </React.StrictMode>
);