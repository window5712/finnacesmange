export interface Income {
  id: string;
  project_name: string;
  client_name: string;
  payment_method: string;
  amount: number;
  date: string;
  file_url?: string;
  file_name?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  file_url?: string;
  file_name?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Salary {
  id: string;
  employee_name: string;
  position: string;
  amount: number;
  payment_date: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  purpose: string;
  amount: number;
  date: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  totalSalaries: number;
  totalInvestments: number;
  grossProfit: number;
  charity: number;
  netDistributable: number;
  partnerShare: number;
  remainingBalance: number;
}

export function calculateFinanceSummary(
  income: Income[],
  expenses: Expense[],
  salaries: Salary[],
  investments: Investment[]
): FinanceSummary {
  const totalIncome = income.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalSalaries = salaries.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalInvestments = investments.reduce((sum, i) => sum + Number(i.amount), 0);

  const grossProfit = totalIncome - totalExpenses - totalSalaries;
  const charity = Math.max(0, grossProfit * 0.05);
  const netDistributable = Math.max(0, grossProfit - charity - totalInvestments);
  const partnerShare = netDistributable * 0.5;
  const remainingBalance = totalIncome - totalExpenses - totalSalaries - totalInvestments;

  return {
    totalIncome,
    totalExpenses,
    totalSalaries,
    totalInvestments,
    grossProfit,
    charity,
    netDistributable,
    partnerShare,
    remainingBalance,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const EXPENSE_CATEGORIES = [
  "office",
  "tools",
  "hosting",
  "marketing",
  "salaries",
  "other",
] as const;

export const PAYMENT_METHODS = [
  "bank_transfer",
  "cash",
  "credit_card",
  "paypal",
  "crypto",
  "other",
] as const;

// Personal Finance Types
export interface PersonalIncome {
  id: string;
  user_id?: string;
  source: string;
  description?: string;
  amount: number;
  date: string;
  category: string;
  is_recurring: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalExpense {
  id: string;
  user_id?: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  payment_method: string;
  is_recurring: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalSavingsGoal {
  id: string;
  user_id?: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalFinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalSavingsTarget: number;
  totalSaved: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export function calculatePersonalSummary(
  income: PersonalIncome[],
  expenses: PersonalExpense[],
  savingsGoals: PersonalSavingsGoal[]
): PersonalFinanceSummary {
  const totalIncome = income.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalSavingsTarget = savingsGoals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  const totalSaved = savingsGoals.reduce((sum, g) => sum + Number(g.current_amount), 0);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthlyIncome = income
    .filter((i) => i.date?.startsWith(currentMonth))
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const monthlyExpenses = expenses
    .filter((e) => e.date?.startsWith(currentMonth))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    totalSavingsTarget,
    totalSaved,
    monthlyIncome,
    monthlyExpenses,
  };
}

export const PERSONAL_INCOME_CATEGORIES = [
  "salary",
  "freelance",
  "business",
  "investments",
  "rental",
  "gifts",
  "other",
] as const;

export const PERSONAL_EXPENSE_CATEGORIES = [
  "food",
  "transport",
  "housing",
  "utilities",
  "entertainment",
  "healthcare",
  "education",
  "shopping",
  "subscriptions",
  "other",
] as const;

// Partner & Wallet Types
export interface PartnerTransaction {
  id: string;
  partner_id: string;
  type: "deposit" | "withdrawal" | "investment";
  amount: number;
  transaction_date: string;
  notes?: string;
  created_at: string;
}

export interface CompanyWallet {
  total_income: number;
  total_partner_deposits: number;
  total_expenses: number;
  total_salaries: number;
  total_partner_outflows: number;
  total_investments: number;
  wallet_balance: number;
}
