"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Download, ArrowUpDown, TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react"
import { getManagerRanking, getInfluencerRanking } from "@/app/actions/dashboard"
import { toast } from "@/components/ui/use-toast"

// Define interfaces matching expected data from actions
interface ManagerData {
  _id: string;
  name: string;
  email: string;
  avatar?: string; // Optional
  influencerCount: number;
  totalSales: number;
  totalCommissions: number;
  trend?: string | number; // Adjust type as needed
  isActive?: boolean; // Optional or required based on backend
}

interface InfluencerData {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  managerName?: string; // Assuming action provides manager name
  couponCode?: string;
  totalSales: number;
  totalCommissions: number;
  trend?: string | number;
  isActive?: boolean;
}

export function PerformanceTable() {
  const [activeTab, setActiveTab] = useState<"managers" | "influencers">("managers")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortColumn, setSortColumn] = useState<keyof ManagerData | keyof InfluencerData>("totalSales")
  const [sortDirection, setSortDirection] = useState("desc")

  // State for fetched data, loading, and errors
  const [managersData, setManagersData] = useState<ManagerData[]>([])
  const [influencersData, setInfluencersData] = useState<InfluencerData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data based on active tab
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === "managers") {
        const result = await getManagerRanking(50); // Fetch a larger number, e.g., 50
        if (result.success && result.ranking) {
            // Map data if necessary - assuming backend returns fields like these
            setManagersData(result.ranking.map(m => ({
                _id: m._id,
                name: m.name,
                email: m.email || 'N/A', // Handle potential missing email
                avatar: m.avatar,
                influencerCount: m.influencerCount || 0,
                totalSales: m.totalValue || m.totalSales || 0, // Adapt based on backend key
                totalCommissions: m.totalCommissions || 0,
                trend: m.trend, // Assuming backend calculates trend?
                isActive: m.isActive ?? true, // Default to true if missing
            })));
        } else {
          throw new Error(result.message || "Falha ao buscar ranking de gerentes");
        }
      } else { // influencers
        const result = await getInfluencerRanking(50);
        if (result.success && result.ranking) {
            setInfluencersData(result.ranking.map(i => ({
                _id: i._id || i.id, // Handle potential id variations
                name: i.name,
                email: i.email || 'N/A',
                avatar: i.avatar,
                managerName: i.managerName || i.manager?.name || 'N/A', // Adapt based on backend
                couponCode: i.couponCode || i.coupon || 'N/A',
                totalSales: i.value || i.totalSales || i.sales || 0,
                totalCommissions: i.commission || i.totalCommissions || 0,
                trend: i.trend,
                isActive: i.isActive ?? true,
            })));
        } else {
          throw new Error(result.message || "Falha ao buscar ranking de influencers");
        }
      }
    } catch (err: any) {
        const errorMsg = err.message || "Erro ao carregar dados da tabela";
        setError(errorMsg);
        toast({ variant: "destructive", title: "Erro", description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrar dados com base na busca
  const filteredManagers = managersData.filter(
    (manager) =>
      manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredInfluencers = influencersData.filter(
    (influencer) =>
      influencer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      influencer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (influencer.managerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (influencer.couponCode || '').toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Ordenar dados
  const sortedManagers = [...filteredManagers].sort((a, b) => {
    const aValue = a[sortColumn as keyof ManagerData];
    const bValue = b[sortColumn as keyof ManagerData];

    // Handle undefined or null values gracefully
    if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
    if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }
    // Add other type handling if necessary (e.g., dates)
    return 0; // Default case
  })

  const sortedInfluencers = [...filteredInfluencers].sort((a, b) => {
    const aValue = a[sortColumn as keyof InfluencerData];
    const bValue = b[sortColumn as keyof InfluencerData];
    
    if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
    if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }
     if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }
    return 0; // Default case
  })

  const handleSort = (column: keyof ManagerData | keyof InfluencerData) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc") // Default to desc when changing column
    }
  }

  // Helper for formatting currency
  const formatCurrency = (value: number | undefined | null) => {
    if (value == null) return "-";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Helper to render trend indicator
  const renderTrend = (trend: string | number | undefined | null) => {
      if (trend == null) return null;
      const isPositive = typeof trend === 'number' ? trend > 0 : typeof trend === 'string' && trend.startsWith('+');
      const isNegative = typeof trend === 'number' ? trend < 0 : typeof trend === 'string' && trend.startsWith('-');
      const trendText = typeof trend === 'number' ? `${trend > 0 ? '+' : ''}${trend}%` : trend;
      
      if (isPositive) {
          return <span className="text-green-600 flex items-center"><TrendingUp className="h-4 w-4 mr-1"/>{trendText}</span>;
      }
      if (isNegative) {
          return <span className="text-red-600 flex items-center"><TrendingDown className="h-4 w-4 mr-1"/>{trendText}</span>;
      }
      return <span className="text-gray-500">{trendText}</span>;
  }
  
  // Main render function
  const renderTableContent = (data: ManagerData[] | InfluencerData[]) => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={activeTab === 'managers' ? 7 : 8} className="text-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500 mx-auto" />
          </TableCell>
        </TableRow>
      );
    }
    if (error) {
       return (
        <TableRow>
          <TableCell colSpan={activeTab === 'managers' ? 7 : 8} className="text-center py-10 text-red-600">
            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
            {error}
          </TableCell>
        </TableRow>
      );
    }
     if (data.length === 0) {
       return (
        <TableRow>
          <TableCell colSpan={activeTab === 'managers' ? 7 : 8} className="text-center py-10 text-gray-500">
            Nenhum dado encontrado{searchQuery ? ' para a busca atual' : ''}.
          </TableCell>
        </TableRow>
      );
    }

    // Render actual data rows
    return data.map((item) => {
       if (activeTab === 'managers') {
            const manager = item as ManagerData;
             return (
                 <TableRow key={manager._id}>
                     <TableCell>
                         <div className="flex items-center gap-3">
                             <Avatar className="h-9 w-9">
                                <AvatarImage src={manager.avatar} alt={manager.name} />
                                <AvatarFallback>{manager.name.charAt(0)}</AvatarFallback>
                             </Avatar>
                             <div className="font-medium">{manager.name}</div>
                         </div>
                     </TableCell>
                     <TableCell>{manager.influencerCount}</TableCell>
                     <TableCell>{formatCurrency(manager.totalSales)}</TableCell>
                     <TableCell>{formatCurrency(manager.totalCommissions)}</TableCell>
                     <TableCell>{renderTrend(manager.trend)}</TableCell>
                     <TableCell>
                         <Badge variant={manager.isActive ? "default" : "outline"} className={manager.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                             {manager.isActive ? "Ativo" : "Inativo"}
                         </Badge>
                     </TableCell>
                 </TableRow>
             );
       } else { // influencers
           const influencer = item as InfluencerData;
           return (
               <TableRow key={influencer._id}>
                   <TableCell>
                       <div className="flex items-center gap-3">
                           <Avatar className="h-9 w-9">
                            <AvatarImage src={influencer.avatar} alt={influencer.name} />
                            <AvatarFallback>{influencer.name.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <div className="font-medium">{influencer.name}</div>
                       </div>
                   </TableCell>
                   <TableCell>{influencer.managerName}</TableCell>
                   <TableCell>
                       <Badge variant="secondary">{influencer.couponCode}</Badge>
                   </TableCell>
                   <TableCell>{formatCurrency(influencer.totalSales)}</TableCell>
                   <TableCell>{formatCurrency(influencer.totalCommissions)}</TableCell>
                   <TableCell>{renderTrend(influencer.trend)}</TableCell>
                   <TableCell>
                       <Badge variant={influencer.isActive ? "default" : "outline"} className={influencer.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                           {influencer.isActive ? "Ativo" : "Inativo"}
                       </Badge>
                   </TableCell>
               </TableRow>
           );
       }
    });
  };

  return (
    <Card className="shadow-md animate-slide-up">
      <CardHeader className="border-b border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <CardTitle>Tabela de Desempenho</CardTitle>
            <CardDescription>
              Detalhes de performance por {activeTab === "managers" ? "gestores" : "influencers"}.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar por nome, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "managers" | "influencers")} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 max-w-sm mb-4">
            <TabsTrigger value="managers">Gestores</TabsTrigger>
            <TabsTrigger value="influencers">Influencers</TabsTrigger>
          </TabsList>
          <TabsContent value="managers">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                      Nome <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead onClick={() => handleSort('influencerCount')} className="cursor-pointer">
                      Influencers <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead onClick={() => handleSort('totalSales')} className="cursor-pointer">
                      Vendas <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead onClick={() => handleSort('totalCommissions')} className="cursor-pointer">
                      Comissão <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead>Tendência</TableHead>
                  <TableHead onClick={() => handleSort('isActive')} className="cursor-pointer">
                      Status <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {renderTableContent(sortedManagers)}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="influencers">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                      Nome <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead onClick={() => handleSort('managerName')} className="cursor-pointer">
                      Gestor <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead>Cupom</TableHead>
                  <TableHead onClick={() => handleSort('totalSales')} className="cursor-pointer">
                      Vendas <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead onClick={() => handleSort('totalCommissions')} className="cursor-pointer">
                      Comissão <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead>Tendência</TableHead>
                  <TableHead onClick={() => handleSort('isActive')} className="cursor-pointer">
                      Status <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {renderTableContent(sortedInfluencers)}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
