"use client";

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Trash2, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { InfluencerData, CouponData, getInfluencerCoupons, createInfluencerCoupon, updateInfluencerCoupon, deleteInfluencerCoupon, checkCouponAvailability } from "@/app/actions/manager";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface CouponManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  influencer: InfluencerData | null;
}

export function CouponManagementModal({ isOpen, onClose, influencer }: CouponManagementModalProps) {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<CouponData | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<{ code: string, available: boolean } | null>(null);

  // Fetch coupons when modal opens or influencer changes
  useEffect(() => {
    if (isOpen && influencer) {
      fetchCoupons();
    } else {
      // Reset state when modal closes or influencer is null
      setCoupons([]);
      setError(null);
      setNewCouponCode("");
      setAvailabilityResult(null);
    }
  }, [isOpen, influencer]);

  async function fetchCoupons() {
    if (!influencer) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getInfluencerCoupons(influencer.id);
      if (result.success && result.coupons) {
        setCoupons(result.coupons);
      } else {
        setError(result.message || "Erro ao buscar cupons.");
      }
    } catch (err) {
      setError("Erro de conexão ao buscar cupons.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCheckAvailability = async () => {
    if (!newCouponCode) return;
    setIsCheckingAvailability(true);
    setAvailabilityResult(null);
    try {
      const result = await checkCouponAvailability(newCouponCode);
      if (result.success) {
        setAvailabilityResult({ code: newCouponCode, available: result.available ?? false });
        if (!result.available) {
           toast({ title: "Cupom Indisponível", description: `O código "${newCouponCode}" já está em uso.`, variant: "destructive" });
        }
      } else {
         toast({ title: "Erro ao Verificar", description: result.message || "Não foi possível verificar a disponibilidade.", variant: "destructive" });
      }
    } catch (err) {
       toast({ title: "Erro de Conexão", description: "Falha ao verificar disponibilidade.", variant: "destructive" });
    } finally {
        setIsCheckingAvailability(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!influencer || !newCouponCode || !availabilityResult || !availabilityResult.available || availabilityResult.code !== newCouponCode) {
      toast({ title: "Ação Inválida", description: "Digite um código de cupom e verifique sua disponibilidade antes de criar.", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      const result = await createInfluencerCoupon(influencer.id, newCouponCode);
      if (result.success && result.coupon) {
        setCoupons([...coupons, result.coupon]);
        setNewCouponCode("");
        setAvailabilityResult(null);
        toast({ title: "Cupom Criado", description: `Cupom "${result.coupon.code}" criado com sucesso.` });
      } else {
         toast({ title: "Erro ao Criar", description: result.message || "Não foi possível criar o cupom.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Erro de Conexão", description: "Falha ao criar cupom.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (coupon: CouponData) => {
     // Optimistic update (optional but improves UX)
     const originalCoupons = [...coupons];
     setCoupons(coupons.map(c => c._id === coupon._id ? { ...c, isActive: !c.isActive } : c));

    try {
      await updateInfluencerCoupon(coupon._id, !coupon.isActive);
      // No need to fetch again if optimistic update is done, backend confirmed implicitly
      toast({ title: "Status Atualizado", description: `Cupom "${coupon.code}" ${!coupon.isActive ? 'ativado' : 'desativado'}.` });
    } catch (err) {
       // Revert optimistic update on error
       setCoupons(originalCoupons);
       toast({ title: "Erro ao Atualizar", description: "Não foi possível atualizar o status do cupom.", variant: "destructive" });
    }
  };

  const handleDeleteClick = (coupon: CouponData) => {
    setCouponToDelete(coupon);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteCoupon = async () => {
    if (!couponToDelete) return;
    // Store ID before resetting state
    const idToDelete = couponToDelete._id;
    const codeToDelete = couponToDelete.code;
    
    // Close confirm dialog
    setDeleteConfirmOpen(false);
    setCouponToDelete(null);

    try {
      const result = await deleteInfluencerCoupon(idToDelete);
      if (result.success) {
        setCoupons(coupons.filter(c => c._id !== idToDelete));
        toast({ title: "Cupom Deletado", description: `Cupom "${codeToDelete}" deletado com sucesso.` });
      } else {
        toast({ title: "Erro ao Deletar", description: result.message || "Não foi possível deletar o cupom.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Erro de Conexão", description: "Falha ao deletar cupom.", variant: "destructive" });
    }
  };

  // Reset availability check when code changes
  useEffect(() => {
      setAvailabilityResult(null);
  }, [newCouponCode]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Cupons - {influencer?.name}</DialogTitle>
          <DialogDescription>
            Adicione, ative/desative ou remova cupons para este influencer.
          </DialogDescription>
        </DialogHeader>

        {/* Add New Coupon Section */} 
        <div className="flex gap-2 my-4">
          <div className="flex-grow relative">
             <Input
               placeholder="Novo Código de Cupom (ex: NOME10)"
               value={newCouponCode}
               onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
               className="pr-24" // Add padding for the button
             />
             <Button 
                type="button"
                variant="outline"
                size="sm"
                className="absolute right-1 top-1 h-8 px-2"
                onClick={handleCheckAvailability}
                disabled={!newCouponCode || isCheckingAvailability || isCreating}
             >
                {isCheckingAvailability ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar"}
             </Button>
          </div>
          <Button
            onClick={handleCreateCoupon}
            disabled={isCreating || !availabilityResult?.available || availabilityResult?.code !== newCouponCode}
            className="bg-pink-600 hover:bg-pink-700"
          >
            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} 
            Criar
          </Button>
        </div>
         {availabilityResult && availabilityResult.code === newCouponCode && (
             <p className={`text-xs mt-1 ${availabilityResult.available ? 'text-green-600' : 'text-red-600'}`}>
                {availabilityResult.available ? 'Código disponível!' : 'Código indisponível.'}
             </p>
         )}

        {/* Coupon List Section */} 
        <div className="mt-4 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-pink-600" />
            </div>
          ) : error ? (
             <p className="text-red-600 text-center py-4">{error}</p>
          ) : coupons.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum cupom encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon._id}>
                    <TableCell className="font-medium">{coupon.code}</TableCell>
                    <TableCell>
                      <Switch
                        checked={coupon.isActive}
                        onCheckedChange={() => handleToggleActive(coupon)}
                        aria-label={coupon.isActive ? "Desativar cupom" : "Ativar cupom"}
                      />
                       <span className="ml-2 text-xs">{coupon.isActive ? 'Ativo' : 'Inativo'}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-700"
                        onClick={() => handleDeleteClick(coupon)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
       <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cupom "{couponToDelete?.code}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCouponToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCoupon} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
} 