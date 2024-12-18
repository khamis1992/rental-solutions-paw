import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2 } from "lucide-react";

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session);
        if (session) {
          navigate("/");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md space-y-8 relative">
        {/* Logo and Branding */}
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Vehicle Rental Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access your dashboard
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'hsl(var(--primary))',
                      brandAccent: 'hsl(var(--primary))',
                      defaultButtonBackground: 'white',
                      defaultButtonBackgroundHover: 'hsl(var(--primary) / 0.1)',
                      defaultButtonBorder: 'lightgray',
                      defaultButtonText: 'gray',
                      dividerBackground: 'hsl(var(--border))',
                    },
                    space: {
                      labelBottomMargin: '8px',
                      anchorBottomMargin: '4px',
                      socialAuthSpacing: '8px',
                      buttonPadding: '10px 15px',
                      inputPadding: '10px 15px',
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '8px',
                      buttonBorderRadius: '8px',
                      inputBorderRadius: '8px',
                    },
                  },
                },
                className: {
                  button: 'transition-colors duration-200',
                  anchor: 'text-primary hover:opacity-80 transition-opacity',
                  input: 'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors',
                  label: 'font-medium',
                  message: 'text-sm',
                },
              }}
              providers={["google"]}
              redirectTo={window.location.origin}
              view="sign_in"
              showLinks={false}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          By signing in, you agree to our{" "}
          <a href="#" className="font-medium text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="font-medium text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;