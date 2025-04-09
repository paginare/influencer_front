"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Users, UserCheck, DollarSign, Award, Loader2 } from "lucide-react"
import { getPerformanceOverviewStats } from "@/app/actions/dashboard"

// Define a type for the stats
interface OverviewStats {
  totalSales: number;
  salesGrowth: number;
  totalCommissions: number;
  commissionGrowth: number;
  activeUsers: number;
  conversionRate: number;
}

export function PerformanceOverview() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>("month")
  const [userType, setUserType] = useState<'all' | 'manager' | 'influencer'>("all")
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data function
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPerformanceOverviewStats(period, userType);
      if (result.success && result.stats) {
        setStats(result.stats);
      } else {
        setError(result.message || "Falha ao carregar estatísticas");
        setStats(null); // Clear stats on error
      }
    } catch (err) {
      setError("Erro de conexão ao buscar estatísticas.");
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [period, userType]);

  // Fetch data on initial load and when filters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper to format currency
  const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <Card className="shadow-md animate-slide-up">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl text-pink-800">Visão Geral de Desempenho</CardTitle>
            <CardDescription>Métricas principais de vendas e comissões</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Tabs 
              defaultValue="all" 
              value={userType} 
              onValueChange={(value) => setUserType(value as 'all' | 'manager' | 'influencer')}
              className="w-full sm:w-[240px]"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="manager">Gestores</TabsTrigger>
                <TabsTrigger value="influencer">Influencers</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select 
              value={period} 
              onValueChange={(value) => setPeriod(value as 'month' | 'quarter' | 'year')}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Último Mês</SelectItem>
                <SelectItem value="quarter">Último Trimestre</SelectItem>
                <SelectItem value="year">Último Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-40 text-red-600">
            {error}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {/* Card de Vendas Totais */}
            <div className="bg-white rounded-lg border border-pink-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Vendas Totais</p>
                  <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalSales)}</h3>
                </div>
                <div className="bg-pink-100 p-2 rounded-full">
                  <DollarSign className="h-6 w-6 text-pink-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stats.salesGrowth >= 0 ? (
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">+{stats.salesGrowth}%</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{stats.salesGrowth}%</span>
                  </div>
                )}
                <span className="text-xs text-gray-500 ml-2">vs. período anterior</span>
              </div>
            </div>

            {/* Card de Comissões */}
            <div className="bg-white rounded-lg border border-pink-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Comissões Pagas</p>
                  <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalCommissions)}</h3>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stats.commissionGrowth >= 0 ? (
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">+{stats.commissionGrowth}%</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{stats.commissionGrowth}%</span>
                  </div>
                )}
                <span className="text-xs text-gray-500 ml-2">vs. período anterior</span>
              </div>
            </div>

            {/* Card de Usuários Ativos */}
            <div className="bg-white rounded-lg border border-pink-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    {userType === "manager"
                      ? "Gestores Ativos"
                      : userType === "influencer"
                        ? "Influencers Ativos"
                        : "Usuários Ativos"}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">{stats.activeUsers}</h3>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  {userType === "manager" ? (
                    <UserCheck className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Users className="h-6 w-6 text-blue-600" />
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <div className="flex items-center text-blue-600">
                  <span className="text-sm font-medium">Taxa de conversão: {stats.conversionRate}%</span>
                </div>
                <span className="text-xs text-gray-500 ml-2">média do período</span>
              </div>
            </div>
          </div>
        ) : (
           <div className="flex justify-center items-center h-40 text-gray-500">
             Nenhum dado encontrado para os filtros selecionados.
           </div>
        )}
      </CardContent>
    </Card>
  )
}
