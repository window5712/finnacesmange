import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Lock, Mail } from "lucide-react";

interface LoginProps {
  searchParams: Promise<Message>;
}

export default async function SignInPage({ searchParams }: LoginProps) {
  const message = await searchParams;

  if ("message" in message) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#1A5C5A] flex items-center justify-center mb-4 shadow-lg">
            <Building2 size={22} className="text-amber-300" />
          </div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Fraunces, serif" }}>
            FinanceOS
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Private Dashboard — Authorised Access Only</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-7">
          <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: "Fraunces, serif" }}>
            Sign in to your account
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            Enter your credentials to access the dashboard.
          </p>

          <form className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  className="pl-9"
                />
              </div>
            </div>

            <SubmitButton
              className="w-full bg-[#1A5C5A] hover:bg-[#154D4B] text-white mt-2"
              pendingText="Signing in..."
              formAction={signInAction}
            >
              Sign In
            </SubmitButton>

            <FormMessage message={message} />
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          This system is for authorised personnel only.
          <br />
          Unauthorised access is strictly prohibited.
        </p>
      </div>
    </div>
  );
}
