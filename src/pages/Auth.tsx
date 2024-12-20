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
            .eq("id", session.user.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching profile:", error);
            return;
          }

          if (data) {
            console.log("Profile data:", data);
            console.log("User profile:", { role: data.role });
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
      <div className="flex min-h-screen items-center justify-end bg-background">
        <div className="w-full max-w-[500px] rounded-lg bg-white p-8 mr-32 shadow-xl">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              style: {
                button: {
                  padding: '12px',
                  fontSize: '16px',
                  width: '100%',
                  marginTop: '8px',
                },
                input: {
                  padding: '12px',
                  fontSize: '16px',
                  width: '100%',
                },
                label: {
                  fontSize: '16px',
                  marginBottom: '8px',
                },
                container: {
                  width: '100%',
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