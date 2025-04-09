"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSalesChart } from "@/app/actions/dashboard"

interface ChartData {
  name: string;
  influencers: number;
  managers: number;
}

export function SalesOverview() {
  const [period, setPeriod] = useState("month")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ChartData[]>([])

  useEffect(() => {
    async function loadChartData() {
      setLoading(true)
      try {
        const periodValue = period === "monthly" ? "month" : period === "weekly" ? "week" : "month"
        const result = await getSalesChart(periodValue as any)
        
        if (result.success && result.data) {
          // Dados já vêm formatados do backend na estrutura esperada pelo componente
          setData(result.data)
          setError(null)
        } else {
          setError(result.message || 'Falha ao carregar dados do gráfico')
          setData([])
        }
      } catch (err) {
        console.error('Erro ao carregar dados do gráfico:', err)
        setError('Erro ao conectar com o servidor')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    loadChartData()
  }, [period])

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl text-pink-800">Visão Geral de Vendas</CardTitle>
            <CardDescription>Vendas por influenciadores e gestores</CardDescription>
          </div>
          <Tabs defaultValue="monthly" value={period} onValueChange={setPeriod} className="w-[240px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="weekly">Semanal</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="h-[320px] flex items-center justify-center">
            <p className="text-gray-500">Carregando dados...</p>
          </div>
        )}
        
        {error && (
          <div className="h-[320px] flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        )}
        
        {!loading && !error && (
          <>
            <div className="h-[320px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      padding: "10px",
                    }}
                  />
                  <Bar dataKey="influencers" name="Influencers" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="managers" name="Gestores" fill="#f472b6" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center mt-4 gap-8">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                <span className="text-sm text-gray-600">Influencers</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-pink-300 mr-2"></div>
                <span className="text-sm text-gray-600">Gestores</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
