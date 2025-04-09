"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { ArrowUpRight, Loader2 } from "lucide-react"
import { getManagerSales, SalesData } from "@/app/actions/manager"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Dados de fallback (para quando a API não retornar dados)
const fallbackData = {
  weekly: [
    { date: "01/04", sales: 4000, commission: 400 },
    { date: "02/04", sales: 3000, commission: 300 },
    { date: "03/04", sales: 5000, commission: 500 },
    { date: "04/04", sales: 2780, commission: 278 },
    { date: "05/04", sales: 1890, commission: 189 },
    { date: "06/04", sales: 2390, commission: 239 },
    { date: "07/04", sales: 3490, commission: 349 },
  ],
  monthly: [
    { date: "Jan", sales: 24000, commission: 2400 },
    { date: "Fev", sales: 18000, commission: 1800 },
    { date: "Mar", sales: 32000, commission: 3200 },
    { date: "Abr", sales: 27800, commission: 2780 },
    { date: "Mai", sales: 18900, commission: 1890 },
    { date: "Jun", sales: 23900, commission: 2390 },
  ],
  totalSales: 145000,
  totalCommission: 14500,
  growth: 8
}

export function ManagerSalesOverview() {
  const [period, setPeriod] = useState("weekly")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [salesData, setSalesData] = useState<{
    weekly: SalesData[];
    monthly: SalesData[];
    totalSales: number;
    totalCommission: number;
    growth: number;
  }>(fallbackData)

  useEffect(() => {
    async function fetchSales() {
      setLoading(true)
      setError(null)
      try {
        const result = await getManagerSales()
        if (result.success && result.data) {
          setSalesData(result.data)
        } else {
          setError(result.message || "Não foi possível carregar os dados de vendas")
          // Usa dados de fallback em caso de erro
          setSalesData(fallbackData)
        }
      } catch (err) {
        console.error("Erro ao buscar dados de vendas:", err)
        setError("Erro ao conectar com o servidor")
        // Usa dados de fallback em caso de erro
        setSalesData(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [])

  const data = period === "weekly" ? salesData.weekly : salesData.monthly

  // Calculate totals
  const totalSales = salesData.totalSales
  const totalCommission = salesData.totalCommission
  const growth = salesData.growth || 0

  return (
    <Card className="card-hover shadow-md animate-slide-up">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl text-pink-800">Suas Vendas</CardTitle>
            <CardDescription>Visão geral das vendas e comissões</CardDescription>
          </div>
          <Tabs defaultValue="weekly" value={period} onValueChange={setPeriod} className="w-[240px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weekly">Semanal</TabsTrigger>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-pink-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Total de Vendas</div>
            {loading ? (
              <div className="flex items-center h-8">
                <Loader2 className="h-5 w-5 animate-spin text-pink-600" />
              </div>
            ) : (
              <div className="flex items-center">
                <div className="text-2xl font-bold text-pink-800">R$ {totalSales.toLocaleString()}</div>
                <div className={`ml-2 flex items-center text-xs font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {growth >= 0 ? '+' : ''}{growth}%
                </div>
              </div>
            )}
          </div>
          <div className="bg-pink-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Total de Comissões</div>
            {loading ? (
              <div className="flex items-center h-8">
                <Loader2 className="h-5 w-5 animate-spin text-pink-600" />
              </div>
            ) : (
              <div className="flex items-center">
                <div className="text-2xl font-bold text-pink-800">R$ {totalCommission.toLocaleString()}</div>
                <div className={`ml-2 flex items-center text-xs font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {growth >= 0 ? '+' : ''}{growth}%
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    padding: "10px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Vendas (R$)"
                  stroke="#ec4899"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  name="Comissão (R$)"
                  stroke="#f472b6"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex justify-center mt-4 gap-8">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
            <span className="text-sm text-gray-600">Vendas</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-pink-300 mr-2"></div>
            <span className="text-sm text-gray-600">Comissões</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
