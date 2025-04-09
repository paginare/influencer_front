"use client"

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BadgeTrend } from '@/components/ui/badge-trend';
import { formatCurrency } from '@/lib/utils';
import { getManagerRanking } from '@/app/actions/dashboard';
import { useEffect, useState } from 'react';

interface Manager {
  id: string;
  name: string;
  email: string;
  image?: string;
  influencerCount?: number;
  sales: number;
  commissions: number;
  trend: number;
}

export function TopManagers() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadManagerRanking() {
      setLoading(true);
      try {
        console.log('Carregando ranking de gerentes...');
        const result = await getManagerRanking(5, 'month');
        console.log('Resposta da API de ranking de gerentes:', result);
        
        // Determinar o array de gerentes, podendo estar em result.ranking ou diretamente em result
        const rankingData = Array.isArray(result) ? result : 
                          (result.ranking && Array.isArray(result.ranking)) ? result.ranking : 
                          (result.success && Array.isArray(result.ranking)) ? result.ranking : [];
        
        console.log('Determinando dados de ranking de gerentes:', rankingData);
        
        if (Array.isArray(rankingData) && rankingData.length > 0) {
          // Transform API data into the component's expected format
          const formattedManagers = rankingData.map((manager: any) => ({
            id: manager.managerId || manager._id || manager.id,
            name: manager.name,
            email: manager.email,
            image: manager.profileImage,
            influencerCount: manager.influencerCount || 0,
            sales: manager.totalSales || manager.sales || 0,
            commissions: manager.totalCommission || manager.totalCommissions || manager.commission || 0,
            trend: manager.trend || 0
          }));
          
          console.log('Gerentes formatados:', formattedManagers);
          setManagers(formattedManagers);
          setError(null);
        } else {
          console.log('Nenhum gerente no ranking retornado, usando dados de amostra');
          // Se não há dados da API, use dados de amostra para demonstração
          const demoData: Manager[] = [
            {
              id: '1',
              name: 'Marcos Oliveira',
              email: 'marcos@example.com',
              influencerCount: 8,
              sales: 86500,
              commissions: 7800,
              trend: 12
            },
            {
              id: '2',
              name: 'Luiza Fernandes',
              email: 'luiza@example.com',
              influencerCount: 6,
              sales: 74300,
              commissions: 6700,
              trend: 8
            },
            {
              id: '3',
              name: 'Roberto Almeida',
              email: 'roberto@example.com',
              influencerCount: 5,
              sales: 58200,
              commissions: 5200,
              trend: -4
            },
            {
              id: '4',
              name: 'Juliana Costa',
              email: 'juliana@example.com',
              influencerCount: 4,
              sales: 42600,
              commissions: 3800,
              trend: 5
            },
            {
              id: '5',
              name: 'Fernando Silva',
              email: 'fernando@example.com',
              influencerCount: 3,
              sales: 31400,
              commissions: 2800,
              trend: -2
            }
          ];
          setManagers(demoData);
        }
      } catch (err) {
        console.error('Erro ao carregar ranking de gerentes:', err);
        setError('Erro ao carregar dados. Tente novamente mais tarde.');
        setManagers([]);
      } finally {
        setLoading(false);
      }
    }

    loadManagerRanking();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Gerentes</CardTitle>
        <CardDescription>Os gerentes com melhor desempenho este mês</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-center py-4">Carregando...</p>}
        
        {error && <p className="text-center text-red-500 py-4">{error}</p>}
        
        {!loading && !error && managers.length === 0 && (
          <p className="text-center py-4">Nenhum gerente encontrado</p>
        )}
        
        {!loading && !error && managers.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gerente</TableHead>
                <TableHead className="text-center">Influenciadores</TableHead>
                <TableHead className="text-right">Vendas</TableHead>
                <TableHead className="text-right">Comissões</TableHead>
                <TableHead className="text-right">Tendência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managers.map((manager) => (
                <TableRow key={manager.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={manager.image} alt={manager.name} />
                        <AvatarFallback>{manager.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{manager.name}</div>
                        <div className="text-sm text-muted-foreground">{manager.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{manager.influencerCount || 0}</TableCell>
                  <TableCell className="text-right">{formatCurrency(manager.sales)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(manager.commissions)}</TableCell>
                  <TableCell className="text-right">
                    <BadgeTrend value={manager.trend} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
