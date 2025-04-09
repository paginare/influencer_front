import { DashboardHeader } from "@/components/dashboard-header"
import { WhatsappConnection } from "@/components/whatsapp-connection"

export default function WhatsappPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Conexão WhatsApp"
        description="Conecte sua conta do WhatsApp para comunicação com influencers"
      />

      <WhatsappConnection />
    </div>
  )
}
