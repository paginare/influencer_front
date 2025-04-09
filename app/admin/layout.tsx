import type React from "react"
import { AdminSidebarContainer } from "@/components/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-full bg-pink-50">
      <AdminSidebarContainer>
        {children}
      </AdminSidebarContainer>
    </div>
  )
}
