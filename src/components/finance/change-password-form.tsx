"use client";

import { useState, useTransition } from "react";
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { changeUserPassword } from "@/app/dashboard/personal/actions";

export function ChangePasswordForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    async function handleSubmit(formData: FormData) {
        const password = formData.get("password") as string;
        const confirm = formData.get("confirmPassword") as string;

        if (password !== confirm) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        startTransition(async () => {
            const result = await changeUserPassword(password);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Password updated successfully");
                setIsOpen(false);
            }
        });
    }

    return (
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <div
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                        <KeyRound size={18} className="text-slate-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm" style={{ fontFamily: "Fraunces, serif" }}>Security Settings</h3>
                        <p className="text-xs text-muted-foreground">Update your password to keep your account secure</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                    {isOpen ? "Cancel" : "Change Password"}
                </Button>
            </div>

            {isOpen && (
                <div className="p-5 border-t border-border bg-slate-50/50">
                    <form action={handleSubmit} className="max-w-md space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    className="pl-9 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    className="pl-9 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2 flex gap-3">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Updating..." : "Update Password"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
