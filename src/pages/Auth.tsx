import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      // Get user profile data
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id);

          if (error) {
            console.error("Error fetching profile:", error);
            return;
          }

          if (data && data.length > 0) {
            const userProfile = data[0];
            console.log("Profile data:", userProfile);
            console.log("User profile:", { role: userProfile.role });
            navigate("/");
          }
        } catch (error) {
          console.error("Error in profile fetch:", error);
        }
      };

      fetchProfile();
    }
  }, [session, navigate]);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-[600px] rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-8 text-center">
            <img 
              src="/lovable-uploads/5ff2d160-bf38-4dbe-ab65-223663cc86b2.png" 
              alt="Rental Solutions Logo" 
              className="mx-auto mb-4 h-20 w-20"
            />
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Rental Solutions</h1>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              style: {
                button: {
                  padding: '12px',
                  fontSize: '16px',
                },
                input: {
                  padding: '12px',
                  fontSize: '16px',
                },
                label: {
                  fontSize: '16px',
                },
              },
            }}
            providers={[]}
          />
        </div>
      </div>
    );
  }

  return null;
}