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

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

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

const renderApp = (session: any) => {
  const startRender = performance.now();
  
  root.render(
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

  const renderTime = performance.now() - startRender;
  console.log(`App rendered in ${renderTime}ms`);
};

const initializeApp = async () => {
  try {
    console.log('Initializing app...');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Initial session:', session);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event);
      
      if (_event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
        queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'auth-dependent' });
      } else if (_event === 'SIGNED_OUT') {
        queryClient.clear();
        localStorage.removeItem('app_session');
      }
      
      renderApp(session);
    });

    renderApp(session);

    window.addEventListener('unload', () => {
      subscription.unsubscribe();
    });

  } catch (error) {
    console.error('Failed to initialize app:', error);
    renderApp(null);
  }
};

console.time('App Initialization');
initializeApp().finally(() => {
  console.timeEnd('App Initialization');
});