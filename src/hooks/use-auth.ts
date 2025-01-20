import { useSessionContext } from "@supabase/auth-helpers-react";

export const useAuth = () => {
  const { session, isLoading, error } = useSessionContext();
  return { session, isLoading, error };
};