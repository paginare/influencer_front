import { Sparkles } from "lucide-react"

interface DashboardHeaderProps {
  title: string
  description: string
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-1 mb-8 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-5 w-5 text-pink-500" />
        <h1 className="text-2xl font-bold tracking-tight text-pink-800">{title}</h1>
      </div>
      <p className="text-gray-500 ml-7">{description}</p>
    </div>
  )
}
