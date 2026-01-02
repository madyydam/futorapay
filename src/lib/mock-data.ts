import { Account } from "@/hooks/useAccounts";
import { Transaction } from "@/hooks/useTransactions";
import { Goal } from "@/hooks/useGoals";
import { Subscription } from "@/hooks/useSubscriptions";

export const GUEST_USER = {
    id: "guest-user-id",
    email: "guest@futorapay.com",
    user_metadata: {
        full_name: "Madhur Dhadve",
        phone: "+91 98765 43210",
        currency: "INR (₹)",
        notifications: true,
        role: "Eco-System Founder"
    },
};

const now = new Date();

export const MOCK_ACCOUNTS: Account[] = [
    {
        id: "mock-acc-1",
        workspace_id: "mock-ws",
        user_id: "guest-user-id",
        name: "HDFC Savings",
        type: "bank_savings",
        current_balance: 1250000,
        currency: "INR",
        institution_name: "HDFC Bank",
        classification: "asset",
        is_active: true,
        is_included_in_networth: true,
        created_at: new Date(now.getTime() - 90 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "mock-acc-2",
        workspace_id: "mock-ws",
        user_id: "guest-user-id",
        name: "ICICI Salary",
        type: "bank_checking",
        current_balance: 445000,
        currency: "INR",
        institution_name: "ICICI Bank",
        classification: "asset",
        is_active: true,
        is_included_in_networth: true,
        created_at: new Date(now.getTime() - 90 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "mock-acc-3",
        workspace_id: "mock-ws",
        user_id: "guest-user-id",
        name: "Amex Platinum",
        type: "credit_card",
        current_balance: 145600,
        currency: "INR",
        institution_name: "American Express",
        classification: "liability",
        is_active: true,
        is_included_in_networth: true,
        created_at: new Date(now.getTime() - 90 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "mock-acc-4",
        workspace_id: "mock-ws",
        user_id: "guest-user-id",
        name: "Zerodha Portfolio",
        type: "investment",
        current_balance: 4250000,
        currency: "INR",
        institution_name: "Zerodha",
        classification: "asset",
        is_active: true,
        is_included_in_networth: true,
        created_at: new Date(now.getTime() - 90 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "mock-acc-5",
        workspace_id: "mock-ws",
        user_id: "guest-user-id",
        name: "Home Loan",
        type: "loan",
        current_balance: 1500000,
        currency: "INR",
        institution_name: "SBI",
        classification: "liability",
        is_active: true,
        is_included_in_networth: true,
        created_at: new Date(now.getTime() - 90 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
    }
];

// Helper to generate meaningful transaction history
const generateTransactions = (): Transaction[] => {
    const txs: Transaction[] = [];

    // Generate transactions for the last 90 days
    for (let i = 0; i < 90; i++) {
        const date = new Date(now.getTime() - i * 86400000);
        const dayStr = date.toISOString();

        // 1. Monthly Salaries (Around 1st of each month)
        if (date.getDate() === 1) {
            txs.push({
                id: `salary-${i}`,
                user_id: "guest-user-id",
                amount: 185000,
                type: "income",
                category: "Salary",
                date: dayStr,
                name: "Monthly Salary Credit",
                payment_method: "Direct Deposit",
                created_at: dayStr
            });
            txs.push({
                id: `freelance-${i}`,
                user_id: "guest-user-id",
                amount: 45000,
                type: "income",
                category: "Freelance",
                date: new Date(date.getTime() + 86400000 * 5).toISOString(),
                name: "Client Project Milestone",
                payment_method: "Bank Transfer",
                created_at: dayStr
            });
        }

        // 2. Daily Expenses
        if (Math.random() > 0.3) {
            txs.push({
                id: `coffee-${i}`,
                user_id: "guest-user-id",
                amount: Math.floor(Math.random() * 500) + 150,
                type: "expense",
                category: "Food",
                date: dayStr,
                name: "Starbucks Coffee",
                payment_method: "UPI",
                created_at: dayStr
            });
        }

        if (date.getDay() === 0 || date.getDay() === 3) {
            txs.push({
                id: `dinner-${i}`,
                user_id: "guest-user-id",
                amount: Math.floor(Math.random() * 2000) + 800,
                type: "expense",
                category: "Food",
                date: dayStr,
                name: "Zomato / Swiggy Order",
                payment_method: "Credit Card",
                created_at: dayStr
            });
        }

        if (date.getDay() === 6) {
            txs.push({
                id: `grocery-${i}`,
                user_id: "guest-user-id",
                amount: Math.floor(Math.random() * 5000) + 2000,
                type: "expense",
                category: "Shopping",
                date: dayStr,
                name: "BigBasket / Blinkit",
                payment_method: "Credit Card",
                created_at: dayStr
            });
        }

        if (date.getDay() === 1 || date.getDay() === 4) {
            txs.push({
                id: `fuel-${i}`,
                user_id: "guest-user-id",
                amount: 2500,
                type: "expense",
                category: "Transport",
                date: dayStr,
                name: "Petrol Pump Refill",
                payment_method: "Debit Card",
                created_at: dayStr
            });
        }
    }

    return txs;
};

export const MOCK_TRANSACTIONS = generateTransactions();

export const MOCK_GOALS: Goal[] = [
    {
        id: "mock-goal-1",
        user_id: "guest-user-id",
        name: "BMW M3 Performance",
        target_amount: 8500000,
        current_amount: 4200000,
        icon: "Car",
        deadline: new Date(now.getFullYear() + 2, 11, 31).toISOString(),
        color: "text-primary",
        created_at: new Date(now.getTime() - 180 * 86400000).toISOString(),
    },
    {
        id: "mock-goal-2",
        user_id: "guest-user-id",
        name: "Maldives Luxury Escape",
        target_amount: 600000,
        current_amount: 450000,
        icon: "Palmtree",
        deadline: new Date(now.getFullYear(), 11, 15).toISOString(),
        color: "text-accent",
        created_at: new Date(now.getTime() - 90 * 86400000).toISOString(),
    },
    {
        id: "mock-goal-3",
        user_id: "guest-user-id",
        name: "Emergency Fund",
        target_amount: 1000000,
        current_amount: 950000,
        icon: "ShieldCheck",
        deadline: new Date(now.getFullYear(), 5, 30).toISOString(),
        color: "text-success",
        created_at: new Date(now.getTime() - 365 * 86400000).toISOString(),
    }
];

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
    {
        id: "mock-sub-1",
        user_id: "guest-user-id",
        name: "OpenAI GPT-4o",
        amount: 1650,
        currency: "INR",
        billing_cycle: "monthly",
        next_billing_date: new Date(now.getTime() + 5 * 86400000).toISOString(),
        category: "AI Tools",
        is_active: true,
        auto_renew: true,
        reminder_days: 2,
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "mock-sub-2",
        user_id: "guest-user-id",
        name: "Adobe Creative Cloud",
        amount: 4200,
        currency: "INR",
        billing_cycle: "monthly",
        next_billing_date: new Date(now.getTime() + 12 * 86400000).toISOString(),
        category: "Design",
        is_active: true,
        auto_renew: true,
        reminder_days: 3,
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "mock-sub-3",
        user_id: "guest-user-id",
        name: "Netflix Premium 4K",
        amount: 649,
        currency: "INR",
        billing_cycle: "monthly",
        next_billing_date: new Date(now.getTime() + 2 * 86400000).toISOString(),
        category: "Entertainment",
        is_active: true,
        auto_renew: true,
        reminder_days: 1,
        notifications_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "mock-sub-4",
        user_id: "guest-user-id",
        name: "AWS Enterprise Hosting",
        amount: 12500,
        currency: "INR",
        billing_cycle: "monthly",
        next_billing_date: new Date(now.getTime() + 25 * 86400000).toISOString(),
        category: "Infrastructure",
        is_active: true,
        auto_renew: true,
        reminder_days: 5,
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

export const MOCK_MONTHLY_SUMMARY = [
    {
        month_start: new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString(),
        total_income: 215000,
        total_expense: 142000,
        net_savings: 73000,
        transaction_count: 58
    },
    {
        month_start: new Date(now.getFullYear(), now.getMonth() - 4, 1).toISOString(),
        total_income: 235000,
        total_expense: 158000,
        net_savings: 77000,
        transaction_count: 62
    },
    {
        month_start: new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString(),
        total_income: 250000,
        total_expense: 185000,
        net_savings: 65000,
        transaction_count: 70
    },
    {
        month_start: new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString(),
        total_income: 220000,
        total_expense: 135000,
        net_savings: 85000,
        transaction_count: 54
    },
    {
        month_start: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
        total_income: 230000,
        total_expense: 150000,
        net_savings: 80000,
        transaction_count: 65
    },
    {
        month_start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        total_income: 285000,
        total_expense: 125000,
        net_savings: 160000,
        transaction_count: 24
    }
];

export const MOCK_CATEGORY_SUMMARY = [
    { category_name: "Housing", total_amount: 45000, transaction_count: 2 },
    { category_name: "Food", total_amount: 28000, transaction_count: 42 },
    { category_name: "Transport", total_amount: 15000, transaction_count: 12 },
    { category_name: "Entertainment", total_amount: 12000, transaction_count: 8 },
    { category_name: "Shopping", total_amount: 25000, transaction_count: 18 },
    { category_name: "Health", total_amount: 8000, transaction_count: 4 },
    { category_name: "AI Tools", total_amount: 5850, transaction_count: 3 },
];
