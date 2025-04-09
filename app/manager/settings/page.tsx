import { DashboardHeader } from "@/components/dashboard-header"
import { UserSettings } from "@/components/user-settings"
import { getProfile } from "@/app/actions/auth"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  // Obter dados do usuário atual usando a server action
  const result = await getProfile()
  
  // Se não houver usuário ou o usuário não for um gerente, redirecionar para login
  if (!result.success || !result.user || result.user.role !== 'manager') {
    return redirect('/login')
  }
  
  // Usar os dados reais do usuário
  const userData = {
    name: result.user.name,
    email: result.user.email,
    role: result.user.role,
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Configurações da Conta" description="Gerencie suas informações pessoais e senha" />

      <UserSettings userData={userData} />
    </div>
  )
}
