import React from "react";
import FinancialDashboard from "@/components/custom/dashboard/FinancialDashboard";
import HealthDashboard from "@/components/custom/dashboard/HealthDashboard"; // <-- Importuj HealthDashboard
// Importujte druge dashboard komponente po potrebi

interface AgentDashboardPageProps {
  params: {
    agentId: string;
  };
}

export default async function AgentDashboardPage({
  params,
}: AgentDashboardPageProps) {
  const { agentId } = params;

  // Logika za prikazivanje odgovarajućeg dashboard-a
  if (agentId === "1") {
    // <-- Dodaj uslov za Health Agenta
    // Opciono: Dohvatite podatke specifične za HealthDashboard ovde
    // const healthData = await fetchHealthData(userId); // Primer
    return <HealthDashboard /* healthData={healthData} */ />;
  } else if (agentId === "2") {
    // Pretpostavka da je ID finansijskog agenta '2'
    // Opciono: Dohvatite podatke specifične za FinancialDashboard ovde
    // const financialData = await fetchFinancialData(userId);
    return <FinancialDashboard /* financialData={financialData} */ />;
  }

  // Dodajte 'else if' za druge agente
  // else if (agentId === '...') { ... }

  // Podrazumevani prikaz ako ID ne odgovara
  return (
    <div className="p-6">
      {" "}
      {/* Dodaj malo paddinga */}
      <h1 className="text-xl font-semibold mb-4">
        Dashboard for Agent ID: {agentId}
      </h1>
      <p>Specific dashboard for this agent is not configured.</p>
      {/* Možeš dodati linkove ka postojećim dashboardima radi lakše navigacije */}
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
