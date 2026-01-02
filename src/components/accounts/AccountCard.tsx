
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Account } from "@/hooks/useAccounts";
import { ArrowUpRight, ArrowDownRight, CreditCard, Wallet, Building2, TrendingUp, PiggyBank, Trash2, Landmark } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AccountCardProps {
    account: Account;
    onDelete?: (id: string) => void;
}

export function AccountCard({ account, onDelete }: AccountCardProps) {
    const getIcon = () => {
        switch (account.type) {
            case "bank_checking":
            case "bank_savings":
                return <Building2 className="h-5 w-5 text-blue-500" />;
            case "cash":
                return <Wallet className="h-5 w-5 text-green-500" />;
            case "credit_card":
                return <CreditCard className="h-5 w-5 text-purple-500" />;
            case "investment":
            case "crypto":
                return <TrendingUp className="h-5 w-5 text-indigo-500" />;
            case "real_estate":
            case "mortgage":
                return <Landmark className="h-5 w-5 text-amber-500" />;
            case "loan":
            case "other_liability":
                return <ArrowDownRight className="h-5 w-5 text-red-500" />;
            default:
                return <Wallet className="h-5 w-5" />;
        }
    };

    const isLiability = ["credit", "loan"].includes(account.type);

    // Fallback formatter if formatCurrency isn't imported or available immediately
    const formattedBalance = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: account.currency || 'INR',
    }).format(account.current_balance);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(account.id);
        }
    };

    return (
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {account.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                    {getIcon()}
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formattedBalance}</div>
                <p className="text-xs text-muted-foreground capitalize">
                    {account.type}
                </p>
            </CardContent>
        </Card>
    );
}
