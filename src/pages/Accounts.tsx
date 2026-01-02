
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AccountCard } from "@/components/accounts/AccountCard";
import { AddAccountDialog } from "@/components/accounts/AddAccountDialog";
import { useAccounts } from "@/hooks/useAccounts";
import { Loader2 } from "lucide-react";

export default function Accounts() {
    const { accounts, isLoading, deleteAccount } = useAccounts();

    const handleDelete = (id: string) => {
        deleteAccount.mutate(id);
    };

    return (
        <DashboardLayout>
            <div className="p-4 lg:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold">Accounts</h1>
                        <p className="text-muted-foreground">
                            Manage your bank accounts, credit cards, and cash.
                        </p>
                    </div>
                    <AddAccountDialog />
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {accounts?.map((account) => (
                            <AccountCard
                                key={account.id}
                                account={account}
                                onDelete={handleDelete}
                            />
                        ))}
                        {accounts?.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                No accounts found. Create one to get started.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
