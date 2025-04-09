import type React from "react"
import { ManagerSidebarContainer } from "@/components/manager-sidebar"

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-full bg-pink-50">
      <ManagerSidebarContainer>
        {children}
      </ManagerSidebarContainer>
    </div>
  )
}
