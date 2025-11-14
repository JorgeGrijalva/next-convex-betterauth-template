"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TwoFactorVerification() {
  const router = useRouter();

  const handleGoBack = () => {
    router.push("/sign-in");
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-slate-800/80 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-sm">
            2FA verification is not yet implemented
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Two-factor authentication is not yet implemented with NextAuth.js in this application.
              This feature will be added in future updates.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need help?{" "}
              <Link href="/documentation" className="text-blue-600 hover:underline">
                View documentation
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}