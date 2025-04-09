import { DashboardHeader } from "@/components/dashboard-header"
import { InfluencerManagement } from "@/components/influencer-management"

export default function InfluencersPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Gerenciar Influencers" description="Crie e gerencie seus influencers" />

      <InfluencerManagement />
    </div>
  )
}
