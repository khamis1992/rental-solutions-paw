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

// Create a client with aggressive optimization
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15,    // Data stays fresh for 15 minutes
      gcTime: 1000 * 60 * 30,       // Keep unused data in cache for 30 minutes
      retry: 1,                      // Only retry failed requests once
      refetchOnWindowFocus: false,   // Don't refetch on window focus
      refetchOnReconnect: false,     // Don't refetch on reconnect unless explicitly needed
      refetchOnMount: false,         // Don't refetch on component mount
      networkMode: 'offlineFirst',   // Use cached data first, then network
    },
  },
});

// Initialize the app with optimized session handling
const initializeApp = async () => {
  try {
    // Get the initial session with caching
    const cachedSession = localStorage.getItem('app_session');
    let initialSession = cachedSession ? JSON.parse(cachedSession) : null;

    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error fetching initial session:', error);
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Error refreshing session:', refreshError);
        renderApp(null);
        return;
      }
      initialSession = refreshedSession;
    } else {
      initialSession = session;
    }

    // Cache the session
    if (initialSession) {
      localStorage.setItem('app_session', JSON.stringify(initialSession));
    }

    console.log('Initial session:', initialSession);

    // Set up optimized auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event);
      
      if (_event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
        // Only invalidate auth-dependent queries
        queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'auth-dependent' });
      } else if (_event === 'SIGNED_OUT') {
        // Clear cache on sign out
        queryClient.clear();
        localStorage.removeItem('app_session');
      }
      
      renderApp(session);
    });

    // Initial render with session
    renderApp(initialSession);

    // Cleanup subscription when the window unloads
    window.addEventListener('unload', () => {
      subscription.unsubscribe();
    });

  } catch (error) {
    console.error('Failed to initialize app:', error);
    renderApp(null);
  }
};

// Helper function to render the app with performance tracking
const renderApp = (session: any) => {
  const startRender = performance.now();
  
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

  // Track render performance
  const renderTime = performance.now() - startRender;
  console.log(`App rendered in ${renderTime}ms`);
};

// Start the application with performance monitoring
console.time('App Initialization');
initializeApp().finally(() => {
  console.timeEnd('App Initialization');
});