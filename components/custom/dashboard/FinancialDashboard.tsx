"use client";

import React, { useState } from "react";
import { StatCard } from "@/components/custom/StatCard";
import { RevenueChart } from "@/components/custom/RevenueChart";
import { SpendingByCategoryChart } from "../DentistRevenueChart";
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
} from "lucide-react";

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

const monthlyIncome = 2800.0;
const mockSpendingByCategory: SpendingByCategory[] = [
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

export default function FinancialDashboard({}: FinancialDashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [financialSummary, setFinancialSummary] =
    useState<UserFinancialSummary>(mockUserFinancialSummary);
  const [monthlySpendingByCategory, setMonthlySpendingByCategory] = useState<
    SpendingByCategory[]
  >(mockSpendingByCategory);
  const [spendingByMerchant, setSpendingByMerchant] = useState<
    SpendingByMerchant[]
  >(mockSpendingByMerchant);

  const formatCurrency = (value: number): string => {
    if (value == null) return "€0";
    return `€${value.toLocaleString("en-IE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

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
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <StatCard
            title="Monthly Income"
            value={formatCurrency(financialSummary.monthlyIncome)}
            icon={DollarSign}
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
            iconBgColor="bg-blue-100 dark:bg-blue-900"
            iconColor="text-blue-600 dark:text-blue-400"
            trendIcon={TrendIcon}
            trendValue={financialSummary.savingsTrend}
            trendColor={trendColor}
            isFinancial={true}
          />
        </div>
        <div className="col-span-12 h-[450px]">
          <RevenueChart
            monthlyIncome={financialSummary.monthlyIncome}
            totalMonthlySpending={totalMonthlySpending}
          />
        </div>
        <div className="col-span-12 lg:col-span-6 h-[420px]">
          <SpendingByCategoryChart monthlyData={monthlySpendingByCategory} />
        </div>
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
      </div>
    </div>
  );
}
