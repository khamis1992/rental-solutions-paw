import { Card } from "@/components/ui/card";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const AuthContainer = () => {
  // Fetch company settings for branding
  const { data: settings } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo and Branding */}
        <div className="text-center space-y-2">
          {settings?.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt="Company Logo" 
              className="h-12 mx-auto mb-4"
            />
          ) : (
            <div className="h-12 flex items-center justify-center text-2xl font-bold text-primary mb-4">
              Rental Solutions
            </div>
          )}
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to {settings?.company_name || 'Rental Solutions'}
          </h1>
          <p className="text-muted-foreground">
            Please sign in to continue to your account
          </p>
        </div>

        {/* Auth Card */}
        <Card className="p-6 backdrop-blur-sm bg-card/95 border-muted">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary))',
                    brandButtonText: 'hsl(var(--primary-foreground))',
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    buttonBorderRadius: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                },
              },
              className: {
                container: 'w-full space-y-4',
                button: 'w-full px-4 py-2 rounded-lg font-medium transition-colors',
                input: 'w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 transition-shadow',
                label: 'text-sm font-medium text-foreground',
                loader: 'border-primary',
              },
            }}
            providers={[]}
            redirectTo={window.location.origin}
          />
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Protected by enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
};