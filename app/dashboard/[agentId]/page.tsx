import React from "react";
import FinancialDashboard from "@/components/custom/dashboard/FinancialDashboard";
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
  if (agentId === "2") {
    // Pretpostavka da je ID finansijskog agenta '2'
    // Opciono: Dohvatite podatke specifične za FinancialDashboard ovde
    // const financialData = await fetchFinancialData(userId);
    return <FinancialDashboard /* financialData={financialData} */ />;
  }

  // Dodajte 'else if' za druge agente
  // else if (agentId === '...') { ... }

  // Podrazumevani prikaz ako ID ne odgovara
  return (
    <div>
      <h1>Dashboard for Agent ID: {agentId}</h1>
      <p>Specific dashboard for this agent is not configured.</p>
    </div>
  );
}
