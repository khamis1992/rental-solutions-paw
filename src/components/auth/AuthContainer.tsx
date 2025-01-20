import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export const AuthContainer = () => {
  const { isLoading, session } = useSessionContext();
  const navigate = useNavigate();

  if (session) {
    navigate("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Rental Solutions</h1>
            <p className="text-gray-600">Please sign in to continue</p>
          </div>
          
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#F97316',
                    brandAccent: '#EA580C',
                    inputBackground: 'white',
                    inputText: '#374151',
                    inputBorder: '#E5E7EB',
                    inputBorderHover: '#F97316',
                    inputBorderFocus: '#F97316',
                  },
                  fonts: {
                    bodyFontFamily: `'Inter', sans-serif`,
                    buttonFontFamily: `'Inter', sans-serif`,
                    inputFontFamily: `'Inter', sans-serif`,
                    labelFontFamily: `'Inter', sans-serif`,
                  },
                }
              },
              className: {
                container: 'w-full',
                button: 'w-full px-4 py-2 rounded-lg font-medium transition-colors',
                input: 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20',
                label: 'text-sm font-medium text-gray-700 mb-1',
                anchor: 'text-primary hover:text-primary-dark transition-colors',
              }
            }}
            providers={[]}
          />
        </Card>
      </div>
    </div>
  );
};