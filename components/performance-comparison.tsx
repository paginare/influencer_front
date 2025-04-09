"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"
import { getManagerRanking, getInfluencerRanking, getPerformanceTimeline } from "@/app/actions/dashboard" // Import actions
import { toast } from "@/components/ui/use-toast"

// Define interfaces for the data types
interface ManagerData {
  _id: string;
  name: string;
  totalSales: number;
  totalCommissions: number;
  influencerCount: number;
}

interface InfluencerData {
  _id: string;
  name: string;
  totalSales: number;
  totalCommissions: number;
  // manager field might not be directly available from ranking, adjust if needed
}

interface TimelineData {
  month: string;
  managerSales: number;
  influencersSales: number; // Match backend key
}

type ChartType = "managers" | "influencers" | "timeline";
type SortByType = "sales" | "commission" | "influencers"; // For managers

export function PerformanceComparison() {
  const [chartType, setChartType] = useState<ChartType>("managers");
  const [sortBy, setSortBy] = useState<SortByType>("sales");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for chart data
  const [managerChartData, setManagerChartData] = useState<ManagerData[]>([]);
  const [influencerChartData, setInfluencerChartData] = useState<InfluencerData[]>([]);
  const [timelineChartData, setTimelineChartData] = useState<TimelineData[]>([]);

  // Fetch data based on chart type
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let result;
      if (chartType === "managers") {
        result = await getManagerRanking(20); // Fetch more for potential sorting view
        if (result.success && result.ranking) {
            // Map backend data to expected structure (totalSales vs value etc.)
            setManagerChartData(result.ranking.map(m => ({ 
                _id: m._id,
                name: m.name,
                totalSales: m.totalValue || m.totalSales || 0, // Adapt based on actual backend response key
                totalCommissions: m.totalCommissions || 0,
                influencerCount: m.influencerCount || 0
            })));
        } else {
          throw new Error(result.message || "Falha ao buscar ranking de gerentes");
        }
      } else if (chartType === "influencers") {
        result = await getInfluencerRanking(20);
        if (result.success && result.ranking) {
             // Map backend data to expected structure
             setInfluencerChartData(result.ranking.map(i => ({
                 _id: i._id || i.id,
                 name: i.name,
                 totalSales: i.value || i.totalSales || i.sales || 0, // Adapt based on actual backend response key
                 totalCommissions: i.commission || i.totalCommissions || 0,
             })));
        } else {
          throw new Error(result.message || "Falha ao buscar ranking de influencers");
        }
      } else if (chartType === "timeline") {
        result = await getPerformanceTimeline('year'); // Fetch yearly timeline data
        if (result.success && result.data) {
          setTimelineChartData(result.data);
        } else {
          throw new Error(result.message || "Falha ao buscar dados da timeline");
        }
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados do gráfico");
      toast({ variant: "destructive", title: "Erro", description: err.message || "Erro ao carregar dados" });
    } finally {
      setIsLoading(false);
    }
  }, [chartType]); // Dependency: chartType

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler to manage chart type change
  const handleChartTypeChange = (value: string) => {
      const newChartType = value as ChartType;
      setChartType(newChartType);
  };

  // useEffect to synchronize sortBy state when chartType changes
  useEffect(() => {
      // Reset sort if the current sortBy is invalid for the new chartType
      if ((chartType === 'influencers' && sortBy === 'influencers') || chartType === 'timeline') {
          if (sortBy !== 'sales') { // Avoid unnecessary state update if already correct
              setSortBy('sales');
          }
      }
  }, [chartType]); // Run this effect when chartType changes

  // Sorting logic based on fetched data
  const sortKeyMap: Record<SortByType, keyof ManagerData | keyof InfluencerData> = {
      sales: 'totalSales',
      commission: 'totalCommissions',
      influencers: 'influencerCount'
  };

  const sortedManagerData = [...managerChartData].sort((a, b) => {
      const key = sortKeyMap[sortBy] as keyof ManagerData;
      return (b[key] as number) - (a[key] as number);
  });
  
  const sortedInfluencerData = [...influencerChartData].sort((a, b) => {
     const key = sortKeyMap[sortBy] as keyof InfluencerData;
     // Handle case where key might not exist on InfluencerData (like influencerCount)
     if (!(key in a) || !(key in b)) return 0;
     return (b[key] as number) - (a[key] as number);
  });

  // Helper to format currency
  const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  // Determine which data to show based on chart type
  const currentData = 
      chartType === 'managers' ? sortedManagerData : 
      chartType === 'influencers' ? sortedInfluencerData : 
      timelineChartData;
      
  const renderChart = () => {
     if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-pink-500" /></div>;
     }
     if (error) {
         return <div className="flex justify-center items-center h-full text-red-600">{error}</div>;
     }
     if (!currentData || currentData.length === 0) {
         return <div className="flex justify-center items-center h-full text-gray-500">Nenhum dado disponível.</div>;
     }

     // Render charts based on type
     switch (chartType) {
        case 'managers':
             return (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentData as ManagerData[]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                            formatter={(value, name) => {
                                if (name === "totalSales" || name === "totalCommissions") {
                                    return [formatCurrency(value as number), name === "totalSales" ? "Vendas" : "Comissão"]
                                }
                                return [value, "Influencers"]
                            }}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            formatter={(value) => {
                                if (value === "totalSales") return "Vendas"
                                if (value === "totalCommissions") return "Comissão"
                                return "Influencers"
                            }}
                        />
                        <Bar dataKey="totalSales" name="totalSales" fill="#ec4899" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="totalCommissions" name="totalCommissions" fill="#f472b6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="influencerCount" name="influencerCount" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            );
        case 'influencers':
             return (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentData as InfluencerData[]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                            formatter={(value, name) => {
                                if (name === "totalSales" || name === "totalCommissions") {
                                    return [formatCurrency(value as number), name === "totalSales" ? "Vendas" : "Comissão"]
                                }
                                return [value, "Gestor"] // Tooltip label
                            }}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            formatter={(value) => {
                                if (value === "totalSales") return "Vendas"
                                if (value === "totalCommissions") return "Comissão"
                                return "Gestor"
                            }}
                        />
                        <Bar dataKey="totalSales" name="totalSales" fill="#ec4899" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="totalCommissions" name="totalCommissions" fill="#f472b6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            );
        case 'timeline':
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentData as TimelineData[]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "8px",
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                padding: "10px",
                            }}
                            formatter={(value) => [formatCurrency(value as number), ""]}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            formatter={(value) => {
                                if (value === "managerSales") return "Gestores"
                                return "Influencers"
                            }}
                        />
                        <Line type="monotone" dataKey="managerSales" name="Gestores" stroke="#ec4899" strokeWidth={2} dot={false} activeDot={{ r: 6 }}/>
                        <Line type="monotone" dataKey="influencersSales" name="Influencers" stroke="#38bdf8" strokeWidth={2} dot={false} activeDot={{ r: 6 }}/>
                    </LineChart>
                </ResponsiveContainer>
            );
        default:
            return null;
     }
  };

  return (
    <Card className="shadow-md animate-slide-up">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl text-pink-800">Comparação de Desempenho</CardTitle>
            <CardDescription>Análise comparativa entre gestores e influencers</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Tabs value={chartType} onValueChange={handleChartTypeChange} className="w-full sm:w-[300px]">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="managers">Gestores</TabsTrigger>
                <TabsTrigger value="influencers">Influencers</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
            </Tabs>
            {/* Sort Select (conditionally rendered) */}
            {chartType !== "timeline" && (
              <Select 
                value={sortBy} 
                onValueChange={(value) => {
                  setSortBy(value as SortByType)
                }}
                disabled={isLoading}
               >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Vendas</SelectItem>
                  <SelectItem value="commission">Comissão</SelectItem>
                  {chartType === "managers" ? 
                    <SelectItem value="influencers">Nº de Influencers</SelectItem> : 
                    null
                  }
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] mt-4">
            {renderChart()} 
        </div>
        {/* Legend can be simplified or removed if chart legends are used */}
        {/* ... dynamic legend rendering based on chartType ... */} 
      </CardContent>
    </Card>
  )
}
