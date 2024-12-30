import { useAuthRedirect } from "@/components/auth/useAuthRedirect";
import { AuthContainer } from "@/components/auth/AuthContainer";

const Auth = () => {
  const { isInitializing, isLoading } = useAuthRedirect();

  if (isInitializing || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return <AuthContainer />;
};

export default Auth;