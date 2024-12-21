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
    // Log render time in development only
    if (process.env.NODE_ENV === 'development') {
      console.log(`App rendered in ${performance.now() - startRender}ms`);
    }
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
  if (process.env.NODE_ENV === 'development') {
    console.time('App Initialization');
  }
  
  let authSubscription: { unsubscribe: () => void } | null = null;

  try {
    const { data: { session } } = await supabase.auth.getSession();

    // Set up auth state change listener with cleanup
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'TOKEN_REFRESHED') {
        // Invalidate auth-dependent queries when token is refreshed
        queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'auth-dependent' });
      } else if (_event === 'SIGNED_OUT') {
        // Clear cache and local storage on sign out
        queryClient.clear();
        localStorage.clear();
      }
      
      root.render(<AppWrapper session={session} />);
    });

    authSubscription = subscription;
    
    // Initial render
    root.render(<AppWrapper session={session} />);

  } catch (error) {
    console.error('Failed to initialize app:', error);
    root.render(<AppWrapper session={null} />);
  } finally {
    if (process.env.NODE_ENV === 'development') {
      console.timeEnd('App Initialization');
    }
  }

  // Cleanup subscription on unload
  window.addEventListener('unload', () => {
    authSubscription?.unsubscribe();
  });
};

initializeApp();