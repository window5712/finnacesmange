"use client";

import { useEffect, useState, useTransition } from "react";
import { getUsers, updateUserRole, requestUserPasswordReset } from "../admin-actions";
import { PageHeader } from "@/components/finance/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { KeyRound, Shield, User as UserIcon } from "lucide-react";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const fetchUsers = async () => {
        setLoading(true);
        const result = await getUsers();
        if (result.error) {
            toast.error(result.error);
        } else {
            setUsers(result.data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = (userId: string, role: string) => {
        startTransition(async () => {
            const result = await updateUserRole(userId, role);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("User role updated");
                fetchUsers();
            }
        });
    };

    const handlePasswordReset = (email: string) => {
        startTransition(async () => {
            const result = await requestUserPasswordReset(email);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Password reset email sent to ${email}`);
            }
        });
    };

    return (
        <div className="p-6 lg:p-8">
            <PageHeader
                title="User Management"
                subtitle="Manage users, roles, and security settings."
                icon="Users"
            />

            <div className="bg-white rounded-2xl card-shadow overflow-hidden mt-6">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-[300px]">User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                    Loading users...
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-muted/10 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <UserIcon size={14} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{user.full_name || user.name || "N/A"}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            defaultValue={user.role || "user"}
                                            onValueChange={(val) => handleRoleChange(user.id, val)}
                                            disabled={isPending}
                                        >
                                            <SelectTrigger className="w-32 h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">User</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs gap-2"
                                            onClick={() => handlePasswordReset(user.email)}
                                            disabled={isPending}
                                        >
                                            <KeyRound size={12} />
                                            Reset Pass
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
