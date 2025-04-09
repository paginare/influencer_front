import { DashboardHeader } from "@/components/dashboard-header"
import { PerformanceOverview } from "@/components/performance-overview"
import { PerformanceComparison } from "@/components/performance-comparison"
import { PerformanceTable } from "@/components/performance-table"

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Análise de Desempenho"
        description="Compare o desempenho de gestores e influencers ao longo do tempo"
      />

      <PerformanceOverview />
      <PerformanceComparison />
      <PerformanceTable />
    </div>
  )
}
