"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Heart, LogOut, Percent, Settings, Users, LineChart, Users2, ShoppingBag, Menu, MessageCircle } from "lucide-react"
import { useState, useEffect } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { logout, getCurrentUser } from "@/app/actions/auth"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"

export function ManagerSidebarContent() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string; role: string; id: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // Iniciais para o avatar fallback
  const initials = user?.name
    ? user.name
        .split(' ')
        .map(name => name[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'GM'

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  const routes = [
    {
      href: "/manager/dashboard",
      icon: BarChart3,
      title: "Dashboard",
    },
    {
      href: "/manager/whatsapp",
      icon: MessageCircle,
      title: "Whatsapp",
    },
    {
      href: "/manager/influencers",
      icon: Users2,
      title: "Influenciadores",
    },
    {
      href: "/manager/settings",
      icon: Settings,
      title: "Configurações",
    },
  ]

  return (
    <>
      <SidebarHeader className="flex h-16 items-center border-b border-pink-100 px-6">
        <Link href="/manager/dashboard" className="flex items-center gap-2 font-bold text-pink-700">
          <div className="bg-pink-100 p-1.5 rounded-md">
            <Heart className="h-5 w-5" />
          </div>
          <span>Gestor Panel</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-6 overflow-y-auto">
        <nav className="grid gap-1.5 px-3">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                pathname === route.href
                  ? "bg-pink-100 text-pink-700"
                  : "text-gray-600 hover:text-pink-700 hover:bg-pink-50",
              )}
            >
              <route.icon
                className={cn("h-5 w-5 transition-all", pathname === route.href ? "text-pink-600" : "text-gray-500")}
              />
              {route.title}
            </Link>
          ))}
        </nav>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-pink-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar className="h-10 w-10 border-2 border-pink-100">
            <AvatarImage src="/placeholder-user.jpg" alt={user?.name || "Manager"} />
            <AvatarFallback className="bg-pink-100 text-pink-700">{initials}</AvatarFallback>
          </Avatar>
          <div>
            {isLoading ? (
              <div className="space-y-1">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-3 w-32 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">{user?.name || "Manager"}</p>
                <p className="text-xs text-gray-500">{user?.email || "manager@example.com"}</p>
              </>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-gray-600 hover:text-pink-700 hover:bg-pink-50 border-pink-100"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </SidebarFooter>
    </>
  )
}

export function ManagerSidebar() {
  return (
    <Sidebar className="bg-white border-r border-pink-100 shadow-sm">
      <ManagerSidebarContent />
    </Sidebar>
  )
}

export function ManagerSidebarMobile() {
  return (
    <div className="flex md:hidden items-center p-2">
      <SidebarTrigger className="bg-white hover:bg-pink-50">
        <Menu className="h-6 w-6 text-pink-700" />
      </SidebarTrigger>
    </div>
  )
}

export function ManagerSidebarContainer({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-full">
        <ManagerSidebar />
        <div className="flex flex-col flex-1 w-full">
          <div className="flex items-center h-16 px-4 border-b border-pink-100 md:hidden bg-white">
            <ManagerSidebarMobile />
            <div className="flex-1 flex justify-center">
              <Link href="/manager/dashboard" className="flex items-center gap-2 font-bold text-pink-700">
                <div className="bg-pink-100 p-1.5 rounded-md">
                  <Heart className="h-5 w-5" />
                </div>
                <span>Gestor Panel</span>
              </Link>
            </div>
          </div>
          <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-pink-50 w-full">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
