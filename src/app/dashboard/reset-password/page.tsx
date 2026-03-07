import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import Navbar from "@/components/navbar";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <form className="flex flex-col space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">Reset password</h1>
              <p className="text-sm text-muted-foreground">
                Please enter your new password below.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" dangerouslySetInnerHTML={{ __html: 'New password' }} className="text-sm font-medium" />
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="New password"
                  required
                  className="w-full"
                  onChange={(e) => {
                    const val = e.target.value;
                    const score = val.length < 8 ? 0 : [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(val)).length;
                    const meter = document.getElementById('password-strength-meter');
                    const text = document.getElementById('password-strength-text');
                    if (meter && text) {
                      const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
                      const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
                      meter.className = `h-1 rounded-full transition-all duration-300 ${colors[score] || 'bg-muted'}`;
                      meter.style.width = `${(score + 1) * 20}%`;
                      text.innerText = labels[score] || 'Too weak';
                      text.className = `text-[10px] font-medium mt-1 ${score > 2 ? 'text-green-600' : 'text-muted-foreground'}`;
                    }
                  }}
                />
                <div className="w-full bg-muted h-1 rounded-full mt-2 overflow-hidden">
                  <div id="password-strength-meter" className="h-full w-0 bg-muted transition-all duration-300"></div>
                </div>
                <p id="password-strength-text" className="text-[10px] text-muted-foreground mt-1">Enter a password</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" dangerouslySetInnerHTML={{ __html: 'Confirm password' }} className="text-sm font-medium" />
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <SubmitButton
              formAction={resetPasswordAction}
              pendingText="Resetting password..."
              className="w-full"
            >
              Reset password
            </SubmitButton>

            <FormMessage message={searchParams} />
          </form>
        </div>
      </div>
    </>
  );
}
