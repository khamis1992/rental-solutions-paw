import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@supabase/auth-helpers-react";

export default function Auth() {
  const { session } = useSessionContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = async () => {
      if (session?.user) {
        // Get user role from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        // Redirect based on role
        if (profile?.role === 'customer') {
          navigate('/customer-portal');
        } else if (profile?.role === 'admin' || profile?.role === 'staff') {
          navigate('/');
        }
      }
    };

    handleAuthChange();
  }, [session, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in to your account
          </p>
        </div>
        <SupabaseAuth 
          supabaseClient={supabase}
          appearance={{
            theme: 'light',
            style: {
              button: {
                background: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
              },
              anchor: {
                color: 'hsl(var(--primary))',
              },
            },
          }}
        />
      </div>
    </div>
  );
}