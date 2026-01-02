# FutoraPay — Product Modes Definition

## 🎯 Core Philosophy

**Mobile First ≠ Mobile Only**

- **Mobile** = Fast, individual-focused, essential features
- **Desktop** = Power-user, business-grade, advanced analytics

---

## 📱 MODE 1: MOBILE / INDIVIDUAL MODE

### Target Users
- Individual users
- Personal finance tracking
- Quick data entry
- On-the-go access

### Features Enabled

#### ✅ Dashboard
- Total balance overview
- Monthly income/expense summary
- Top 3 spending categories
- Recent 5 transactions
- Goal progress (visual only)

#### ✅ Transactions
- **Add Transaction** (simplified form):
  - Amount
  - Category (dropdown)
  - Type (Income/Expense toggle)
  - Date
  - Notes (optional)
- View recent transactions (last 30 days)
- Search transactions (basic)
- Filter by category

#### ✅ Goals
- View all goals
- Add new goal
- Update progress
- Visual progress bars
- Simple deadline tracking

#### ✅ Accounts
- View account balances
- Add new account (basic)
- Update balance manually
- Account types: Cash, Bank, Credit Card

#### ✅ Profile
- View profile
- Edit name
- Change password
- Currency preference
- Dark mode toggle
- Logout

#### ✅ Notifications
- View notifications
- Mark as read
- System alerts only

### Features DISABLED (Mobile)

❌ **Reports** — No PDF/Excel generation  
❌ **Advanced Analytics** — No charts, trends, or insights  
❌ **AI Insights** — No AI-powered recommendations  
❌ **Multi-workspace** — Single workspace only  
❌ **Bulk Import** — No CSV/Excel upload  
❌ **Business Tools** — No P&L, Cash Flow, Burn Rate  
❌ **Tags System** — No custom tags  
❌ **Advanced Filters** — Basic filters only  
❌ **Export Data** — No data export options  

---

## 💻 MODE 2: DESKTOP / ADVANCED MODE

### Target Users
- Business owners
- Startups
- Finance professionals
- Power users
- Accountants
- Anyone needing advanced analytics

### Features Enabled (ALL Mobile + Below)

#### ✅ Advanced Dashboard
- Full KPI panels
- Income trend charts (6 months)
- Expense breakdown charts
- Category-wise spending (pie chart)
- Monthly comparison graphs
- Net worth tracker
- Burn rate calculator
- Runway projection

#### ✅ Advanced Transactions
- Bulk import (CSV, Excel)
- Advanced filters:
  - Date range
  - Amount range
  - Multiple categories
  - Tags
  - Payment method
  - Custom fields
- Tag management
- Custom categories
- Recurring transactions
- Split transactions
- Attachments (receipts)

#### ✅ Reports Center
- **Individual Reports**:
  - Monthly Expense Report
  - Income Summary
  - Net Worth Report
  - Category Analysis
  - Custom Date Range Reports
  
- **Business Reports**:
  - Profit & Loss Statement
  - Cash Flow Statement
  - Burn Rate & Runway Analysis
  - Balance Sheet
  - Tax Summary

- **Export Options**:
  - PDF (professional, branded)
  - Excel (.xlsx) with multiple sheets
  - CSV (raw data)

- **Report Snapshots**:
  - Historical reports stored
  - Compare month-over-month
  - Audit trail

#### ✅ Advanced Accounts & Assets
- Multiple account types:
  - Cash
  - Bank Accounts (Checking, Savings)
  - Credit Cards
  - Loans
  - Investments
  - Real Estate
  - Crypto
  - Other Assets
- Account reconciliation
- Transfer between accounts
- Interest tracking
- Debt payoff calculator

#### ✅ Multi-Workspace Support
- Create multiple workspaces
- Personal vs Business separation
- Switch between workspaces
- Workspace-level settings
- Invite team members (future)

#### ✅ AI Insights Panel
- Spending anomaly detection
- Budget recommendations
- Savings opportunities
- Bill prediction
- Cash flow warnings
- Goal achievement probability
- Personalized financial tips

#### ✅ Advanced Goals
- Goal dependencies
- Milestone tracking
- Auto-save rules
- Goal templates
- Investment projections

#### ✅ Settings & Customization
- Workspace settings
- Team management (future)
- API access (future)
- Custom categories
- Custom tags
- Notification preferences
- Data export
- Backup & restore

---

## 🔒 Feature Gating Logic

### Detection Method
```typescript
const isMobile = window.innerWidth < 1024;
```

### Implementation Strategy

1. **Component-level gating**:
```typescript
import { useIsMobile } from '@/hooks/use-mobile';

const ReportsPanel = () => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileDisabledMessage feature="Reports" />;
  }
  
  return <AdvancedReports />;
};
```

2. **Route-level gating**:
```typescript
// Desktop-only routes
/reports
/analytics
/ai-insights
/workspaces
```

3. **Navigation gating**:
- Mobile: Show only basic nav items
- Desktop: Show full navigation menu

---

## 💰 Monetization Strategy

### Free Tier (Both Mobile & Desktop)
- 1 workspace
- 100 transactions/month
- Basic reports (1/month)
- No AI insights

### Premium Individual ($9.99/month)
- Unlimited transactions
- Unlimited reports
- PDF/Excel export
- AI insights
- Priority support

### Premium Business ($29.99/month)
- Everything in Individual
- 5 workspaces
- Team members (up to 5)
- Business reports
- API access
- White-label reports

### Enterprise (Custom pricing)
- Unlimited workspaces
- Unlimited team members
- Custom integrations
- Dedicated support
- SLA guarantee

---

## 📊 Success Metrics

### Mobile Users
- Daily active sessions
- Transaction entry speed
- Goal completion rate

### Desktop Users
- Reports generated/month
- AI insights engagement
- Workspace creation rate
- Export frequency

---

## 🚀 Upgrade Path

**Mobile User Journey:**
1. Downloads app
2. Tracks basic expenses
3. Realizes need for reports
4. Opens desktop version
5. Discovers advanced features
6. Upgrades to Premium

**Desktop User Journey:**
1. Signs up on web
2. Uses basic features
3. Needs business reports
4. Hits free tier limit
5. Upgrades to Business plan
6. Invites team members

---

## ✅ Implementation Checklist

- [ ] Create `useIsMobile()` hook
- [ ] Add feature gate component `<DesktopOnly>`
- [ ] Update navigation based on mode
- [ ] Desktop-only routes
- [ ] Mobile-optimized layouts
- [ ] Feature upgrade prompts
- [ ] Analytics tracking

---

**Last Updated:** 2026-01-02  
**Status:** Foundation Document  
**Next:** Database Schema Implementation
