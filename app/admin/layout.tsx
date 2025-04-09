import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-pink-50">
      <AdminSidebar />
      <div className="flex-1 p-8 overflow-y-auto">{children}</div>
    </div>
  )
}
