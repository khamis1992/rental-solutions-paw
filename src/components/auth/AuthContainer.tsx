import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionContext } from "@supabase/auth-helpers-react";

export const AuthContainer = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSessionContext();

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="m-auto w-full max-w-md">
          <Card className="p-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="m-auto w-full max-w-md">
        <Card className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Welcome to Rental Solutions</h1>
            <p className="text-gray-600">Please sign in to continue</p>
          </div>
          
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#F97316',
                    brandAccent: '#EA580C',
                    inputBackground: 'white',
                    inputText: 'black',
                    inputPlaceholder: '#9CA3AF',
                  },
                  space: {
                    inputPadding: '1rem',
                    buttonPadding: '1rem',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    buttonBorderRadius: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                  fonts: {
                    bodyFontFamily: `'Inter', sans-serif`,
                    buttonFontFamily: `'Inter', sans-serif`,
                    inputFontFamily: `'Inter', sans-serif`,
                  },
                }
              },
              className: {
                container: 'w-full',
                button: 'w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded transition-colors',
                input: 'w-full px-4 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                label: 'block text-sm font-medium text-gray-700 mb-1',
                anchor: 'text-primary hover:text-primary-dark',
              }
            }}
            providers={[]}
            redirectTo={window.location.origin}
          />
        </Card>
      </div>
    </div>
  );
};