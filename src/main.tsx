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

// Get the allowed origins from window
declare global {
  interface Window {
    ALLOWED_ORIGINS?: string[];
    TRUSTED_ORIGIN?: string;
  }
}

const ALLOWED_ORIGINS = window.ALLOWED_ORIGINS || [];
const TRUSTED_ORIGIN = window.TRUSTED_ORIGIN || window.location.origin;

// Configure query client with optimized caching settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // Data remains fresh for 15 minutes
      gcTime: 1000 * 60 * 30, // Cache is garbage collected after 30 minutes
      retry: 1, // Only retry failed requests once
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      networkMode: 'offlineFirst',
    },
  },
});

// Add event listener for postMessage with origin verification
window.addEventListener('message', (event) => {
  // Verify the origin is in our allowed list
  if (!ALLOWED_ORIGINS.includes(event.origin)) {
    console.warn('Received message from untrusted origin:', event.origin);
    return;
  }

  // Process the message
  try {
    if (event.data && typeof event.data === 'object') {
      console.log('Received trusted message:', event.data);
      // Handle the message based on its type
      if (event.data.type === 'gptengineer') {
        // Handle gptengineer specific messages
        console.log('Processing gptengineer message:', event.data);
      }
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
}, false);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <SessionContextProvider supabaseClient={supabase}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <TooltipProvider>
              <App />
            </TooltipProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </SessionContextProvider>
    </ErrorBoundary>
  </React.StrictMode>
);