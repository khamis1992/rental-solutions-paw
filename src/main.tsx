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

// Configure query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      networkMode: 'offlineFirst',
    },
  },
});

// Initialize app with better error handling and cleanup
const initializeApp = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      renderApp(session);
    });

    // Initial render
    renderApp(session);

    // Cleanup subscription on unload
    window.addEventListener('unload', () => {
      subscription?.unsubscribe();
    });

  } catch (error) {
    console.error('Failed to initialize app:', error);
    renderApp(null);
  }
};

// Separate render function to maintain consistency
const renderApp = (session: any) => {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <ErrorBoundary>
          <SessionContextProvider 
            supabaseClient={supabase}
            initialSession={session}
          >
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <App />
              </TooltipProvider>
            </QueryClientProvider>
          </SessionContextProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </React.StrictMode>
  );
};

initializeApp();