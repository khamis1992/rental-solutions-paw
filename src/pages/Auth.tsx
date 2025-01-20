import { AuthContainer } from "@/components/auth/AuthContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { UserRound } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Rental Solutions</h1>
            <p className="text-gray-600">Please choose how you want to sign in</p>
          </div>

          <div className="space-y-4">
            <Button 
              variant="default" 
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2"
              onClick={() => navigate("/customer-portal")}
            >
              <UserRound className="w-5 h-5" />
              Customer Portal Login
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <AuthContainer />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;