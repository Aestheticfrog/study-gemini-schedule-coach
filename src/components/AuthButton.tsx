
import { Button } from "@/components/ui/button";
import { user } from "@/lib/api";
import { LogIn, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export function AuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();

  // Check for current user on component mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await user.current();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error checking user:", error);
        // Silent fail - we just won't have a user
      }
    };
    
    checkUser();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await user.signInWithGoogle();
      // The page will reload after OAuth redirect
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: "Could not sign in with Google. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await user.signOut();
      setCurrentUser(null);
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "Could not sign out. Please try again.",
      });
    }
  };

  if (currentUser) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <UserRound className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleSignOut}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      <LogIn className="mr-2 h-4 w-4" />
      Sign in
    </Button>
  );
}
