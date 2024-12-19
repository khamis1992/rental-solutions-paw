import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Building2, Clock } from "lucide-react";

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

  // Get current time for greeting
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Get current date
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Header Section */}
      <div className="w-full p-8 bg-white border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              {getCurrentGreeting()}
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome to Rental Solutions
            </p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-5 w-5" />
            <span>{getCurrentDate()}</span>
          </div>
        </div>
      </div>

      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Building2 className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access the dashboard
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: 'rgb(99, 102, 241)',
                        brandAccent: 'rgb(79, 70, 229)',
                        defaultButtonBackground: 'white',
                        defaultButtonBackgroundHover: 'rgb(243, 244, 246)',
                        defaultButtonBorder: 'rgb(229, 231, 235)',
                        defaultButtonText: 'rgb(17, 24, 39)',
                        dividerBackground: 'rgb(229, 231, 235)',
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
                    input: 'focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors',
                    label: 'font-medium',
                    message: 'text-sm',
                  },
                }}
                redirectTo={window.location.origin}
                view="sign_in"
                showLinks={false}
              />
            </CardContent>
          </Card>

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
    </div>
  );
};

export default AuthPage;