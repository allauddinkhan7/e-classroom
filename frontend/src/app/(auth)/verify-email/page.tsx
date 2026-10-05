"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyEmailRequest } from "@/lib/auth/auth-api";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    verifyEmailRequest(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="space-y-6 text-center">
      {status === "loading" && (
        <>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Verifying your email...</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Email verified</h1>
            <p className="text-sm text-muted-foreground">Your account is now verified.</p>
          </div>
          <Button variant="outline">
            <Link href="/login">Go to login</Link>
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="mx-auto h-10 w-10 text-destructive" />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Verification failed</h1>
            <p className="text-sm text-muted-foreground">
              This link is invalid or has expired.
            </p>
          </div>
          <Button variant="outline">
            <Link href="/login">Back to login</Link>
          </Button>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}