"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Mail, Calendar, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useUser } from "@/hooks/useUser";

interface InvitationData {
  email: string;
  organizationName: string;
  expiresAt: string;
  status: string;
}

export function InviteContent({ token }: { token: string }) {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const response = await fetch(`/api/invitations/${token}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || "Invalid invitation");
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setInvitation(data.invitation);
      } catch (err) {
        setError("Failed to load invitation");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!user) {
      // Redirect to login with invitation token
      router.push(`/login?invitation=${token}`);
      return;
    }

    // Check if user's email matches invitation email
    if (user.email.toLowerCase() !== invitation?.email.toLowerCase()) {
      toast.error("Email mismatch", {
        description: `This invitation is for ${invitation?.email}. Please sign in with that email.`,
      });
      return;
    }

    setIsAccepting(true);

    try {
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to accept invitation");
      }

      toast.success("Welcome to the team!", {
        description: "You've successfully joined the organization.",
      });

      router.push("/dashboard");
    } catch (err) {
      toast.error("Failed to accept invitation", {
        description: err instanceof Error ? err.message : "Please try again later",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading || isUserLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            Invalid Invitation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Go to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!invitation) {
    return null;
  }

  const isExpired = new Date(invitation.expiresAt) < new Date();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          You're Invited!
        </CardTitle>
        <CardDescription>
          Join {invitation.organizationName} as a staff member
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invitation Details */}
        <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-zinc-500" />
            <span className="text-sm font-medium">{invitation.organizationName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-zinc-500" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {invitation.email}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-zinc-500" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Expires {format(new Date(invitation.expiresAt), "PPP")}
            </span>
          </div>
        </div>

        {/* Expired Warning */}
        {isExpired && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This invitation has expired. Please contact the organization owner for a new invitation.
            </AlertDescription>
          </Alert>
        )}

        {/* Email Mismatch Warning */}
        {user && user.email.toLowerCase() !== invitation.email.toLowerCase() && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This invitation is for {invitation.email}. You're currently signed in as {user.email}.
              Please sign out and sign in with the correct email.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {!user ? (
            <>
              <Button
                onClick={handleAccept}
                disabled={isExpired || isAccepting}
                className="w-full"
              >
                {isAccepting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Continue to Sign In
              </Button>
              <p className="text-sm text-center text-zinc-600 dark:text-zinc-400">
                Don't have an account? You'll be able to create one after clicking above.
              </p>
            </>
          ) : (
            <>
              <Button
                onClick={handleAccept}
                disabled={
                  isExpired ||
                  isAccepting ||
                  user.email.toLowerCase() !== invitation.email.toLowerCase()
                }
                className="w-full"
              >
                {isAccepting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Accept Invitation
              </Button>
              {user.email.toLowerCase() !== invitation.email.toLowerCase() && (
                <Link href="/auth/signout">
                  <Button variant="outline" className="w-full">
                    Sign Out
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
