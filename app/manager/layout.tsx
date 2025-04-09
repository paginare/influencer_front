import type React from "react"
import { ManagerSidebar } from "@/components/manager-sidebar"

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-pink-50">
      <ManagerSidebar />
      <div className="flex-1 p-8 overflow-y-auto">{children}</div>
    </div>
  )
}
