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

// Helper function to render the app
const renderApp = (session: any) => {
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
};

// Initialize the app with session
const initializeApp = async () => {
  try {
    // Get the initial session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error fetching session:', error);
      // Even if there's an error, render the app with null session
      renderApp(null);
      return;
    }

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session);
      // Re-render with new session
      renderApp(session);
    });

    // Initial render with session
    renderApp(session);

    // Cleanup subscription on unmount
    window.addEventListener('unload', () => {
      subscription.unsubscribe();
    });

  } catch (error) {
    console.error('Failed to initialize app:', error);
    // Render without session in case of error
    renderApp(null);
  }
};

// Start the application
initializeApp();