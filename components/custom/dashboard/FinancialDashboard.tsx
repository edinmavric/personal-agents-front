"use client";

import React, { useState } from "react";
// Assuming components are copied/installed and paths are correct
import { StatCard } from "@/components/custom/StatCard";
import { RevenueChart } from "@/components/custom/RevenueChart";
// Ensure the import path matches the renamed file if you renamed it
import { SpendingByCategoryChart } from "../DentistRevenueChart"; // Updated import if renamed
import { ServiceRevenueChart } from "@/components/custom/ServiceRevenueChart";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  LucideIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Receipt,
  // ... other icons
} from "lucide-react";

// --- Interfaces ---
interface UserFinancialSummary {
  monthlyIncome: number;
  upcomingExpenses: number;
  savingsTrend: string;
  savingsGoal: number;
}
interface SpendingByCategory {
  category: string;
  amount: number;
}
interface SpendingByMerchant {
  merchant: string;
  amount: number;
}

interface FinancialDashboardProps {}

// --- Mock Data ---
const monthlyIncome = 2800.0;
const mockSpendingByCategory: SpendingByCategory[] = [
  // ... (keep existing mockSpendingByCategory data)
  { category: "Housing", amount: 900.0 },
  { category: "Food & Drink", amount: 550.0 },
  { category: "Bills & Utilities", amount: 250.0 },
  { category: "Shopping", amount: 300.0 },
  { category: "Transport", amount: 150.0 },
  { category: "Entertainment", amount: 180.0 },
  { category: "Other", amount: 120.0 },
];
const totalMonthlySpending = mockSpendingByCategory.reduce(
  (sum, item) => sum + item.amount,
  0
);
const mockSpendingByMerchant: SpendingByMerchant[] = [
  // ... (keep existing mockSpendingByMerchant data)
  { merchant: "Rent Agency", amount: 900.0 },
  { merchant: "SuperMart", amount: 350.0 },
  { merchant: "OnlineRetail", amount: 180.0 },
  { merchant: "Restaurant GoodFood", amount: 120.0 },
  { merchant: "Electricity Co.", amount: 110.0 },
  { merchant: "Clothing Store", amount: 100.0 },
  { merchant: "Gas Station", amount: 90.0 },
  { merchant: "Corner Cafe", amount: 80.0 },
  { merchant: "Internet Provider", amount: 60.0 },
  { merchant: "Gym Membership", amount: 50.0 },
  { merchant: "Cinema", amount: 45.0 },
  { merchant: "Water Company", amount: 40.0 },
  { merchant: "Pharmacy", amount: 35.0 },
  { merchant: "Streaming Svc", amount: 15.0 },
  { merchant: "Misc Small Shops", amount: 130.0 },
];
const actualSavings = monthlyIncome - totalMonthlySpending;
const savingsGoal = 350.0;
const upcomingExpenses = 900.0 + 250.0;
const mockUserFinancialSummary: UserFinancialSummary = {
  monthlyIncome: monthlyIncome,
  upcomingExpenses: upcomingExpenses,
  savingsTrend: actualSavings >= savingsGoal ? "+1.5%" : "-0.5%",
  savingsGoal: savingsGoal,
};
// --- End Mock Data ---

export default function FinancialDashboard({}: FinancialDashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [financialSummary, setFinancialSummary] =
    useState<UserFinancialSummary>(mockUserFinancialSummary);
  // Keep state for the base monthly data
  const [monthlySpendingByCategory, setMonthlySpendingByCategory] = useState<
    SpendingByCategory[]
  >(mockSpendingByCategory);
  const [spendingByMerchant, setSpendingByMerchant] = useState<
    SpendingByMerchant[]
  >(mockSpendingByMerchant);

  // Format currency as Euros
  const formatCurrency = (value: number): string => {
    // ... (keep existing formatCurrency function)
    if (value == null) return "€0";
    return `€${value.toLocaleString("en-IE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Determine savings trend icon and color
  const isPositiveTrend = financialSummary.savingsTrend.startsWith("+");
  const TrendIcon: LucideIcon = isPositiveTrend ? TrendingUp : TrendingDown;
  const trendColor = isPositiveTrend
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      {" "}
      {/* Adjusted space-y */}
      <div className="grid grid-cols-12 gap-6">
        {/* StatCards */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <StatCard
            title="Monthly Income"
            value={formatCurrency(financialSummary.monthlyIncome)}
            icon={DollarSign}
            // Add missing props with default/appropriate colors
            iconBgColor="bg-green-100 dark:bg-green-900"
            iconColor="text-green-600 dark:text-green-400"
            isFinancial={true}
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 ">
          <StatCard
            title="Upcoming Expenses"
            value={formatCurrency(financialSummary.upcomingExpenses)}
            icon={Receipt}
            // Add missing props with default/appropriate colors
            iconBgColor="bg-orange-100 dark:bg-orange-900"
            iconColor="text-orange-600 dark:text-orange-400"
            isFinancial={true}
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <StatCard
            title="Monthly Savings Goal"
            value={formatCurrency(financialSummary.savingsGoal)}
            icon={Target}
            // Add missing props with default/appropriate colors
            iconBgColor="bg-blue-100 dark:bg-blue-900"
            iconColor="text-blue-600 dark:text-blue-400"
            trendIcon={TrendIcon}
            // Rename 'trend' prop to 'trendValue'
            trendValue={financialSummary.savingsTrend}
            trendColor={trendColor}
            isFinancial={true}
          />
        </div>

        {/* REORDERED: Spending Chart (Income vs Spending) - Moved Up */}
        <div className="col-span-12 h-[450px]">
          <RevenueChart
            monthlyIncome={financialSummary.monthlyIncome} // Pass income
            totalMonthlySpending={totalMonthlySpending} // Pass total monthly spending
          />
        </div>

        {/* Spending by Category Chart */}
        <div className="col-span-12 lg:col-span-6 h-[420px]">
          {/* Pass the base monthly data */}
          <SpendingByCategoryChart monthlyData={monthlySpendingByCategory} />
        </div>

        {/* Top/Bottom Spending Chart */}
        <Card className="col-span-12 lg:col-span-6 h-[420px] flex flex-col">
          <CardHeader className="pt-4 px-6 shrink-0">
            <CardTitle className="text-xl font-semibold">
              Spending Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              <div className="col-span-1 h-full">
                <ServiceRevenueChart
                  className="h-full"
                  // Data for this chart remains monthly/overall highlights
                  data={spendingByMerchant.map((merchantItem) => ({
                    item: merchantItem.merchant,
                    amount: merchantItem.amount,
                  }))}
                  displayMode="top"
                />
              </div>
              <div className="col-span-1 h-full">
                <ServiceRevenueChart
                  className="h-full"
                  // Data for this chart remains monthly/overall highlights
                  data={spendingByMerchant.map((merchantItem) => ({
                    item: merchantItem.merchant,
                    amount: merchantItem.amount,
                  }))}
                  displayMode="bottom"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* REMOVED from here: Spending Chart (Income vs Spending) was moved up */}
      </div>{" "}
      {/* Closing grid div */}
    </div> /* Closing main container div */
  );
}
