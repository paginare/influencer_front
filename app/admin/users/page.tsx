import { DashboardHeader } from "@/components/dashboard-header"
import { UserManagement } from "@/components/user-management"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Gestão de Usuários" description="Crie e gerencie contas de gestores" />

      <UserManagement />
    </div>
  )
}
