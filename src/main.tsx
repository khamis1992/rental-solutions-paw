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

// Create a memoized app wrapper component
const AppWrapper = React.memo(({ session }: { session: any }) => {
  const startRender = performance.now();
  
  React.useEffect(() => {
    console.log(`App rendered in ${performance.now() - startRender}ms`);
  }, [startRender]);

  return (
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
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
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
});

AppWrapper.displayName = 'AppWrapper';

// Initialize app with better error handling and cleanup
const initializeApp = async () => {
  console.time('App Initialization');
  
  try {
    console.log('Initializing app...');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Initial session:', session);

    // Set up auth state change listener with cleanup
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event);
      
      if (_event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
        queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'auth-dependent' });
      } else if (_event === 'SIGNED_OUT') {
        queryClient.clear();
        localStorage.removeItem('app_session');
      }
      
      root.render(<AppWrapper session={session} />);
    });

    // Initial render
    root.render(<AppWrapper session={session} />);

    // Cleanup subscription on unload
    window.addEventListener('unload', () => {
      subscription.unsubscribe();
    });

  } catch (error) {
    console.error('Failed to initialize app:', error);
    root.render(<AppWrapper session={null} />);
  } finally {
    console.timeEnd('App Initialization');
  }
};

initializeApp();