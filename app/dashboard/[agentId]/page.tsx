import React from "react";
import FinancialDashboard from "@/components/custom/dashboard/FinancialDashboard";
import HealthDashboard from "@/components/custom/dashboard/HealthDashboard";

interface AgentDashboardPageProps {
  params: {
    agentId: string;
  };
}

export default async function AgentDashboardPage({
  params,
}: AgentDashboardPageProps) {
  const { agentId } = params;

  if (agentId === "1") {
    return <HealthDashboard />;
  } else if (agentId === "2") {
    return <FinancialDashboard />;
  }

  return (
    <div className="p-6">
      {" "}
      <h1 className="text-xl font-semibold mb-4">
        Dashboard for Agent ID: {agentId}
      </h1>
      <p>Specific dashboard for this agent is not configured.</p>
      <div className="mt-4 space-x-4">
        <a href="/dashboard/1" className="text-blue-600 hover:underline">
          View Health Dashboard (ID 1)
        </a>
        <a href="/dashboard/2" className="text-blue-600 hover:underline">
          View Financial Dashboard (ID 2)
        </a>
      </div>
    </div>
  );
}
