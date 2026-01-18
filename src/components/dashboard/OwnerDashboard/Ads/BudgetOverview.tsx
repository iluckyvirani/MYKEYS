"use client";

import { DollarSign, TrendingUp, AlertCircle, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const budgetData = {
  monthlyBudget: 150000,
  spentThisMonth: 98500,
  dailyBudget: 5000,
  dailySpent: 3200,
  campaigns: [
    { name: "Facebook Campaigns", budget: 50000, spent: 32500 },
    { name: "Instagram Ads", budget: 30000, spent: 18500 },
    { name: "Google Ads", budget: 20000, spent: 8500 },
    { name: "Display Network", budget: 50000, spent: 39000 },
  ],
  upcomingCharges: [
    { date: "2024-01-31", amount: 15000, description: "Facebook Ads" },
    { date: "2024-02-01", amount: 25000, description: "Monthly Budget Reset" },
    { date: "2024-02-05", amount: 8000, description: "Instagram Boost" },
  ],
};

export default function BudgetOverview() {
  const remainingBudget = budgetData.monthlyBudget - budgetData.spentThisMonth;
  const dailyRemaining = budgetData.dailyBudget - budgetData.dailySpent;
  const budgetUtilization = (budgetData.spentThisMonth / budgetData.monthlyBudget) * 100;
  
  const getBudgetColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
          <p className="text-sm text-gray-500 mt-1">
            Monitor and control your ad spending
          </p>
        </div>
        <div className="p-2 bg-green-100 rounded-lg">
          <DollarSign className="w-5 h-5 text-green-600" />
        </div>
      </div>

      {/* Budget Summary */}
      <div className="space-y-6 mb-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Monthly Budget</div>
            <div className={`font-bold ${getBudgetColor(budgetUtilization)}`}>
              {budgetUtilization.toFixed(1)}% used
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-green-500"
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-gray-600">Spent: {formatCurrency(budgetData.spentThisMonth)}</span>
            <span className="font-medium">Remaining: {formatCurrency(remainingBudget)}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Daily Budget</div>
            <div className="font-medium">
              Spent: {formatCurrency(budgetData.dailySpent)} / {formatCurrency(budgetData.dailyBudget)}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${(budgetData.dailySpent / budgetData.dailyBudget) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {formatCurrency(dailyRemaining)} available for today
          </div>
        </div>
      </div>

      {/* Campaign Budgets */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Campaign Budgets</h4>
        <div className="space-y-3">
          {budgetData.campaigns.map((campaign) => {
            const utilization = (campaign.spent / campaign.budget) * 100;
            
            return (
              <div key={campaign.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{campaign.name}</span>
                  <span className="text-xs text-gray-600">
                    {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-green-500"
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Charges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Upcoming Charges</h4>
          <Button variant="ghost" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            View Schedule
          </Button>
        </div>
        <div className="space-y-3">
          {budgetData.upcomingCharges.map((charge, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div>
                <div className="font-medium text-gray-900">{charge.description}</div>
                <div className="text-xs text-gray-500">
                  {new Date(charge.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </div>
              </div>
              <div className="font-bold text-gray-900">
                {formatCurrency(charge.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Alert */}
      {budgetUtilization >= 75 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Budget Alert</div>
              <div className="text-sm text-gray-600 mt-1">
                {budgetUtilization >= 90 
                  ? "Your monthly budget is almost exhausted. Consider increasing your budget to avoid campaign pausing."
                  : "Your monthly budget is 75% used. Monitor spending to stay within budget."}
              </div>
            </div>
          </div>
        </div>
      )}

      <Button variant="outline" className="w-full mt-6">
        Adjust Budget Settings
      </Button>
    </div>
  );
}