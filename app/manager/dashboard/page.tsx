import { DashboardHeader } from "@/components/dashboard-header"
import { ManagerSalesOverview } from "@/components/manager-sales-overview"
import { InfluencersList } from "@/components/influencers-list"

export default function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Painel do Gestor" description="Gerencie seus influencers e acompanhe suas vendas" />

      <ManagerSalesOverview />
      <InfluencersList />
    </div>
  )
}
