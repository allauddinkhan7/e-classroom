"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordRequest } from "@/lib/auth/auth-api";
import { useForm } from "react-hook-form";

const schema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});
type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "" },
  });

  async function onSubmit(values: FormValues) {
    if (!token) {
      setStatus("error");
      return;
    }
    try {
      await resetPasswordRequest(token, values.newPassword);
      setStatus("success");
      toast.success("Password updated");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setStatus("error");
    }
  }

  if (!token || status === "error") {
    return (
      <div className="space-y-4 text-center">
        <XCircle className="mx-auto h-10 w-10 text-destructive" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Link invalid or expired</h1>
          <p className="text-sm text-muted-foreground">
            Please request a new password reset link.
          </p>
        </div>
        <Button variant="outline">
          <Link href="/forgot-password">Request new link</Link>
        </Button>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Password updated</h1>
          <p className="text-sm text-muted-foreground">
            Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="At least 8 characters"
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="text-sm text-destructive">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Updating..." : "Update password"}
        </Button>
      </form>
    </div>
  );
}
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
