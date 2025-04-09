import { DashboardHeader } from "@/components/dashboard-header"
import { CommissionSettings } from "@/components/commission-settings"

export default function CommissionsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Configuração de Comissões"
        description="Configure as faixas de comissão para influencers e gestores"
      />

      <CommissionSettings />
    </div>
  )
}
