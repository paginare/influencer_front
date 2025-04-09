import { SalesOverview } from "@/components/sales-overview"
import { TopInfluencers } from "@/components/top-influencers"
import { TopManagers } from "@/components/top-managers"
import { DashboardHeader } from "@/components/dashboard-header"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Painel Administrativo" description="Visão geral de vendas, influencers e gestores" />

      <SalesOverview />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopInfluencers />
        <TopManagers />
      </div>
    </div>
  )
}
