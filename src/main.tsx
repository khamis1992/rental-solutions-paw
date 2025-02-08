
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { ThemeProvider } from '@/components/theme/theme-provider';
import App from './App.tsx';
import './index.css';

// Create root element once
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

// Create a stable QueryClient instance with retry configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data remains fresh for 5 minutes
      gcTime: 1000 * 60 * 60, // Cache is kept for 1 hour
      retry: 1, // Only retry failed requests once
      refetchOnWindowFocus: false,
    },
  },
});

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SessionContextProvider supabaseClient={supabase}>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="light" 
            enableSystem 
            storageKey="app-theme"
            disableTransitionOnChange
          >
            <App />
          </ThemeProvider>
        </SessionContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
