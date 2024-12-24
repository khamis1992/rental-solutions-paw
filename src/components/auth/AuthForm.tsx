import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export const AuthForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session) {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate("/");
    } else if (event === "SIGNED_OUT") {
      toast({
        title: "Signed out",
        description: "You have been signed out.",
      });
      navigate("/auth");
    } else if (event === "USER_UPDATED") {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated.",
      });
    } else if (event === "PASSWORD_RECOVERY") {
      toast({
        title: "Password recovery",
        description: "Check your email for password reset instructions.",
      });
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
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
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'w-full',
                input: 'rounded-md',
                message: 'text-red-500 text-sm',
              },
            }}
            providers={[]}
            view="sign_in"
            showLinks={true}
            theme="light"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;