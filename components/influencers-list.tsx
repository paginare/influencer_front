"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Plus, ArrowUpRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getMyInfluencers, InfluencerData } from "@/app/actions/manager"

// Dados de fallback (para quando a API não retornar dados)
const fallbackInfluencers = [
  {
    id: "1",
    name: "Ana Silva",
    coupon: "ANA10",
    sales: 12500,
    commission: 1250,
    avatar: "/placeholder-user.jpg",
    trend: "+12%",
    status: "Ativo",
    email: "ana@example.com",
    phone: "(11) 98765-4321",
    instagram: "@anasilva",
  },
  {
    id: "2",
    name: "Bruno Costa",
    coupon: "BRUNO15",
    sales: 10800,
    commission: 1080,
    avatar: "/placeholder-user.jpg",
    trend: "+8%",
    status: "Ativo",
    email: "bruno@example.com",
    phone: "(21) 98765-4321",
    instagram: "@brunocosta",
  },
  {
    id: "3",
    name: "Carla Mendes",
    coupon: "CARLA20",
    sales: 9200,
    commission: 920,
    avatar: "/placeholder-user.jpg",
    trend: "+5%",
    status: "Ativo",
    email: "carla@example.com",
    phone: "(31) 98765-4321",
    instagram: "@carlamendes",
  },
  {
    id: "4",
    name: "Diego Santos",
    coupon: "DIEGO25",
    sales: 8500,
    commission: 850,
    avatar: "/placeholder-user.jpg",
    trend: "+3%",
    status: "Ativo",
    email: "diego@example.com",
    phone: "(41) 98765-4321",
    instagram: "@diegosantos",
  },
]

export function InfluencersList() {
  const [influencers, setInfluencers] = useState<InfluencerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInfluencers() {
      setLoading(true)
      setError(null)
      try {
        const result = await getMyInfluencers()
        if (result.success && result.influencers) {
          setInfluencers(result.influencers)
        } else {
          setError(result.message || "Não foi possível carregar os influencers")
          // Usa dados de fallback em caso de erro
          setInfluencers(fallbackInfluencers)
        }
      } catch (err) {
        console.error("Erro ao buscar influencers:", err)
        setError("Erro ao conectar com o servidor")
        // Usa dados de fallback em caso de erro
        setInfluencers(fallbackInfluencers)
      } finally {
        setLoading(false)
      }
    }

    fetchInfluencers()
  }, [])

  return (
    <Card className="card-hover shadow-md animate-slide-up">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl text-pink-800">Seus Influencers</CardTitle>
          <CardDescription>Gerencie seus influencers e acompanhe o desempenho</CardDescription>
        </div>
        <Link href="/manager/influencers">
          <Button className="bg-pink-600 hover:bg-pink-700 shadow-md mt-4 sm:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Novo Influencer
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
          </div>
        ) : influencers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum influencer encontrado.</p>
            <p className="mt-2 text-sm">Clique em "Novo Influencer" para adicionar um.</p>
          </div>
        ) : (
          <div className="space-y-5 mt-2">
            {influencers.map((influencer, index) => (
              <div
                key={influencer.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${index === 0 ? "bg-pink-50" : "hover:bg-gray-50"}`}
              >
                <div className="relative">
                  <Avatar className={`h-12 w-12 border-2 ${index === 0 ? "border-pink-300" : "border-gray-100"}`}>
                    <AvatarImage src={influencer.avatar || "/placeholder-user.jpg"} alt={influencer.name} />
                    <AvatarFallback className="bg-pink-100 text-pink-700">
                      {influencer.name.split(' ').map(name => name[0]).slice(0, 2).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {index === 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      1
                    </span>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">{influencer.name}</p>
                    <div className="flex items-center text-xs text-green-600 font-medium">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {influencer.trend}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center text-xs text-gray-500 gap-y-1">
                    <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200 mr-2">
                      {influencer.coupon}
                    </Badge>
                    <span className="font-medium text-gray-700">R$ {influencer.sales.toLocaleString()}</span>
                    <span className="mx-2">•</span>
                    <span>Comissão: R$ {influencer.commission.toLocaleString()}</span>
                  </div>
                </div>
                <Link href={`/manager/influencers/${influencer.id}`}>
                  <Button variant="outline" size="sm" className="border-pink-200 text-pink-700 hover:bg-pink-50">
                    Detalhes
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
