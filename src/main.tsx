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

// Initialize the app with session
const initializeApp = async () => {
  try {
    // Get the initial session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error fetching session:', error);
      throw error;
    }

    // Render the app with the session
    root.render(
      <React.StrictMode>
        <SessionContextProvider 
          supabaseClient={supabase} 
          initialSession={session}
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
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // Render the app without a session in case of error
    root.render(
      <React.StrictMode>
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
      </React.StrictMode>
    );
  }
};

// Start the application
initializeApp();