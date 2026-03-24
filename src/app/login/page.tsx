"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithPassword } from "@/app/login/actions";
import {
  AlertCircle,
  Eye,
  EyeOff,
  LayoutDashboard,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Missing email.");
      setLoading(false);
      return;
    }
    if (!password) {
      setError("Missing password.");
      setLoading(false);
      return;
    }

    const result = await loginWithPassword(trimmedEmail, password);
    if (!result.ok) {
      setError(result.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-10 sm:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-[40%] left-1/2 h-[min(120vw,56rem)] w-[min(120vw,56rem)] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl dark:bg-primary/[0.14]" />
        <div className="absolute -bottom-[30%] -left-[20%] h-[min(90vw,42rem)] w-[min(90vw,42rem)] rounded-full bg-muted-foreground/[0.06] blur-3xl" />
      </div>

      <Card className="relative z-10 w-full max-w-md border-border/60 shadow-xl shadow-black/5 ring-1 ring-border/40 dark:shadow-black/20 p-4">
        <CardHeader className="space-y-4 pb-2 text-center sm:text-left">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20 sm:mx-0">
            <LayoutDashboard className="size-6" aria-hidden />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="font-heading text-2xl font-semibold tracking-tight">
              CRM Pro
            </CardTitle>
            <CardDescription className="text-base">
              Sign in to continue to your workspace
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative isolate h-10 w-full">
                <span
                  className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-9 items-center justify-center text-muted-foreground"
                  aria-hidden
                >
                  <Mail className="size-4 shrink-0" />
                </span>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@crm.com"
                  required
                  disabled={loading}
                  className="h-10 w-full pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative isolate h-10 w-full">
                <span
                  className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-9 items-center justify-center text-muted-foreground"
                  aria-hidden
                >
                  <Lock className="size-4 shrink-0" />
                </span>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="h-10 w-full pl-9 pr-10"
                />
                <div className="absolute inset-y-0 right-0 z-10 flex w-10 items-center justify-center">
                  <button
                    type="button"
                    className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-muted/50"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={loading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4 shrink-0" strokeWidth={2} />
                    ) : (
                      <Eye className="size-4 shrink-0" strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error ? (
              <div
                role="alert"
                className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive dark:border-destructive/40 dark:bg-destructive/10"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>{error}</span>
              </div>
            ) : null}

            <Button
              className="h-10 w-full"
              type="submit"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Secure sign-in powered by your CRM Pro system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
