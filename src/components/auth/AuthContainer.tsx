
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export const AuthContainer = () => {
  const { isLoading, session, error } = useSessionContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      if (error.message?.includes('invalid_credentials')) {
        toast.error('Invalid login credentials. Please try again.');
      } else {
        toast.error('An error occurred while signing in.');
      }
    }
  }, [error]);

  if (session) {
    navigate("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">Welcome Back</h2>
        <p className="text-sm text-gray-600">Staff & Admin Login</p>
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
        localization={{
          variables: {
            sign_in: {
              email_label: 'Email',
              password_label: 'Password',
              button_label: 'Sign In',
              loading_button_label: 'Signing in...',
              social_provider_text: 'Sign in with',
              link_text: ''  // Remove "Don't have an account? Sign up"
            },
            forgotten_password: {
              link_text: '',  // Remove "Forgot your password?"
              button_label: 'Send reset email',
            }
          }
        }}
      />
    </Card>
  );
};
