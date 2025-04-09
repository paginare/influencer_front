"use client"

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BadgeTrend } from '@/components/ui/badge-trend';
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from '@/lib/utils';
import { getInfluencerRanking } from '@/app/actions/dashboard';
import { useEffect, useState } from 'react';

interface Influencer {
  id: string;
  name: string;
  email: string;
  image?: string;
  coupon?: string;
  sales: number;
  commissions: number;
  trend: number;
}

export function TopInfluencers() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInfluencerRanking() {
      setLoading(true);
      try {
        console.log('Carregando ranking de influenciadores...');
        const result = await getInfluencerRanking(5, 'month');
        console.log('Resposta da API de ranking:', result);
        
        // Determinar o array de influenciadores, podendo estar em result.ranking ou diretamente em result
        const rankingData = Array.isArray(result) ? result : 
                          (result.ranking && Array.isArray(result.ranking)) ? result.ranking : 
                          (result.success && Array.isArray(result.ranking)) ? result.ranking : [];
        
        console.log('Determinando dados de ranking:', rankingData);
        
        if (Array.isArray(rankingData) && rankingData.length > 0) {
          // Transform API data into the component's expected format
          const formattedInfluencers = rankingData.map((influencer: any) => ({
            id: influencer.influencerId || influencer._id || influencer.id,
            name: influencer.name,
            email: influencer.email,
            image: influencer.profileImage,
            coupon: influencer.couponCode,
            sales: influencer.totalSales || influencer.sales || 0,
            commissions: influencer.totalCommission || influencer.totalCommissions || influencer.commission || 0,
            trend: influencer.trend || 0
          }));
          
          console.log('Influenciadores formatados:', formattedInfluencers);
          setInfluencers(formattedInfluencers);
          setError(null);
        } else {
          console.log('Nenhum influenciador no ranking retornado, usando dados de amostra');
          // Se não há dados da API, use dados de amostra para demonstração
          const demoData: Influencer[] = [
            {
              id: '1',
              name: 'Isabella Santos',
              email: 'isabella@example.com',
              coupon: 'BELLA10',
              sales: 12500,
              commissions: 1250,
              trend: 15
            },
            {
              id: '2',
              name: 'Rafael Oliveira',
              email: 'rafael@example.com',
              coupon: 'RAFA20',
              sales: 10800,
              commissions: 1080,
              trend: 8
            },
            {
              id: '3',
              name: 'Carolina Lima',
              email: 'carolina@example.com',
              coupon: 'CAROL15',
              sales: 9300,
              commissions: 930,
              trend: -3
            },
            {
              id: '4',
              name: 'Gabriel Costa',
              email: 'gabriel@example.com',
              coupon: 'GABS25',
              sales: 7800,
              commissions: 780, 
              trend: 5
            },
            {
              id: '5',
              name: 'Amanda Souza',
              email: 'amanda@example.com',
              coupon: 'AMANDA10',
              sales: 6500,
              commissions: 650,
              trend: -2
            }
          ];
          setInfluencers(demoData);
        }
      } catch (err) {
        console.error('Erro ao carregar ranking de influenciadores:', err);
        setError('Erro ao carregar dados. Tente novamente mais tarde.');
        setInfluencers([]);
      } finally {
        setLoading(false);
      }
    }

    loadInfluencerRanking();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Influenciadores</CardTitle>
        <CardDescription>Os influenciadores com melhor desempenho este mês</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-center py-4">Carregando...</p>}
        
        {error && <p className="text-center text-red-500 py-4">{error}</p>}
        
        {!loading && !error && influencers.length === 0 && (
          <p className="text-center py-4">Nenhum influenciador encontrado</p>
        )}
        
        {!loading && !error && influencers.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Influenciador</TableHead>
                <TableHead>Cupom</TableHead>
                <TableHead className="text-right">Vendas</TableHead>
                <TableHead className="text-right">Comissões</TableHead>
                <TableHead className="text-right">Tendência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {influencers.map((influencer) => (
                <TableRow key={influencer.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={influencer.image} alt={influencer.name} />
                        <AvatarFallback>{influencer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{influencer.name}</div>
                        <div className="text-sm text-muted-foreground">{influencer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {influencer.coupon && (
                      <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                        {influencer.coupon}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(influencer.sales)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(influencer.commissions)}</TableCell>
                  <TableCell className="text-right">
                    <BadgeTrend value={influencer.trend} />
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
