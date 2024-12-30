import { Card } from "@/components/ui/card";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

export const AuthContainer = () => {
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
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  }
                }
              },
              className: {
                container: 'w-full',
                button: 'w-full px-4 py-2 rounded',
                input: 'w-full px-3 py-2 border rounded',
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