"use client"

import { useState, useEffect, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Loader2, Save, Info, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { getCommissionTiers, saveCommissionTiersBulk } from "@/app/actions/commissions"

// Define CommissionTier type based on action
interface CommissionTierData {
  _id?: string;
  minSalesValue: number;
  maxSalesValue?: number;
  commissionPercentage: number;
}

// Update schema to handle an array of tiers
const formSchema = z.object({
  tiers: z.array(z.object({
    minSalesValue: z.number({ invalid_type_error: "Deve ser número" }).min(0, "Valor não pode ser negativo"),
    maxSalesValue: z.number({ invalid_type_error: "Deve ser número" }).min(0, "Valor não pode ser negativo").optional(),
    commissionPercentage: z.number({ invalid_type_error: "Deve ser número" }).min(0, "Não pode ser negativo").max(100, "Não pode ser > 100"),
  }))
  // Add refinement for checking overlaps and max > min
  .refine(tiers => {
    for (let i = 0; i < tiers.length; i++) {
      const current = tiers[i];
      // Check max > min
      if (current.maxSalesValue !== undefined && current.maxSalesValue <= current.minSalesValue) {
        return false; // Invalid if max <= min
      }
      // Check for overlaps with previous tiers
      if (i > 0) {
        const prev = tiers[i-1];
        if (prev.maxSalesValue === undefined || current.minSalesValue <= prev.maxSalesValue) {
          return false; // Invalid if overlaps or previous has no max
        }
        if (current.minSalesValue !== prev.maxSalesValue + 1) {
             // Optional: enforce no gaps? This might be too strict.
             // return false; 
        }
      }
    }
    return true;
  }, { message: "Faixas inválidas: verifique sobreposições, valores (max > min) ou sequências." })
});

type CommissionFormData = z.infer<typeof formSchema>;

export function CommissionSettings() {
  const [activeTab, setActiveTab] = useState<"influencer" | "manager">("influencer")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTierMinValue, setNewTierMinValue] = useState<string>("");

  const form = useForm<CommissionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { tiers: [] },
    mode: 'onChange',
  })

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "tiers"
  });

  const fetchTiers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCommissionTiers(activeTab);
      if (result.success && result.tiers) {
        replace(result.tiers.map(t => ({
            minSalesValue: t.minSalesValue,
            maxSalesValue: t.maxSalesValue,
            commissionPercentage: t.commissionPercentage
        })));
      } else {
        setError(result.message || "Falha ao buscar faixas de comissão");
        toast({ variant: "destructive", title: "Erro", description: result.message || "Falha ao buscar faixas" });
      }
    } catch (err) {
      setError("Erro de conexão ao buscar faixas de comissão");
      toast({ variant: "destructive", title: "Erro", description: "Erro de conexão" });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, replace]);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  const addTier = () => {
    console.log("Add tier button clicked...");
    const lastTierIndex = fields.length - 1;
    const lastTier = fields.length > 0 ? form.getValues(`tiers.${lastTierIndex}`) : null;
    console.log("Last tier data:", lastTier);

    setNewTierMinValue("");
    setIsModalOpen(true);
    console.log("Opening modal to set new tier minimum.");
  };

  const removeTier = (index: number) => {
    if (fields.length <= 1) {
      toast({ description: "Deve haver pelo menos uma faixa de comissão." });
      return;
    }
    
    // If removing the very last tier, set the new last tier's max value to undefined
    if (index === fields.length - 1 && index > 0) {
        console.log(`Removing last tier (index ${index}). Setting tier ${index - 1} maxSalesValue to undefined.`);
        form.setValue(`tiers.${index - 1}.maxSalesValue`, undefined);
    }
    
    console.log(`Removing tier at index ${index}`);
    remove(index);
  };

  const handleConfirmAddTier = () => {
    console.log("Confirm button clicked in modal. Value:", newTierMinValue);
    const newMinValue = parseFloat(newTierMinValue);
    const lastTierIndex = fields.length - 1;
    const lastTier = fields.length > 0 ? form.getValues(`tiers.${lastTierIndex}`) : null;
    
    if (isNaN(newMinValue) || newMinValue < 0) {
        toast({ variant: "destructive", title: "Valor Inválido", description: "Por favor, insira um valor mínimo positivo para a nova faixa." });
        return;
    }
    if (lastTier && newMinValue <= lastTier.minSalesValue) {
        toast({ variant: "destructive", title: "Valor Inválido", description: `O valor mínimo deve ser maior que o valor mínimo da faixa anterior (${lastTier.minSalesValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}).` });
        return;
    }
    if (!lastTier && newMinValue < 0) {
        toast({ variant: "destructive", title: "Valor Inválido", description: "O valor mínimo não pode ser negativo." });
        return;
    }

    console.log("Validation passed. Updating previous tier and appending new one.");

    if (lastTierIndex >= 0) {
        const previousMax = newMinValue - 0.01;
        console.log(`Setting tiers.${lastTierIndex}.maxSalesValue to: ${previousMax}`);
        form.setValue(`tiers.${lastTierIndex}.maxSalesValue`, previousMax > 0 ? previousMax : 0);
    }

    const newTierData = { minSalesValue: newMinValue, commissionPercentage: 0 };
    console.log("Appending new tier:", newTierData);
    try {
        append(newTierData);
        console.log("Append successful.");
        setIsModalOpen(false);
        toast({ 
            title: "Faixa Adicionada", 
            description: `Nova faixa começando em ${newMinValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} foi adicionada.` 
        });
    } catch (error) {
        console.error("Error during append:", error);
        toast({ variant: "destructive", title: "Erro Interno", description: "Falha ao tentar adicionar a faixa após confirmação." });
    }
  };

  async function onSubmit(values: CommissionFormData) {
    setIsSubmitting(true);
    try {
        const tiersToSave = values.tiers;

        const result = await saveCommissionTiersBulk(activeTab, tiersToSave);

        if (result.success) {
            toast({
                title: "Configurações Salvas",
                description: `As faixas de comissão para ${activeTab === 'influencer' ? 'influencers' : 'gestores'} foram salvas.`,
            });
            if (result.tiers) {
                 replace(result.tiers.map(t => ({
                    minSalesValue: t.minSalesValue,
                    maxSalesValue: t.maxSalesValue,
                    commissionPercentage: t.commissionPercentage
                })));
            }
        } else {
            toast({ variant: "destructive", title: "Erro ao Salvar", description: result.message || "Não foi possível salvar as faixas." });
        }
    } catch (error) {
        toast({ variant: "destructive", title: "Erro de Conexão", description: "Não foi possível conectar ao servidor." });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <>
    <Tabs defaultValue="influencer" value={activeTab} onValueChange={(value) => setActiveTab(value as "influencer" | "manager")} className="animate-fade-in">
      <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
        <TabsTrigger value="influencer">Influencers</TabsTrigger>
        <TabsTrigger value="manager">Gestores</TabsTrigger>
      </TabsList>

      <Card className="shadow-md">
        <CardHeader className="bg-pink-50 rounded-t-lg border-b border-pink-100">
          <CardTitle className="text-xl text-pink-800">
            Comissões de {activeTab === 'influencer' ? 'Influencers' : 'Gestores'}
          </CardTitle>
          <CardDescription>Configure as faixas de comissão baseadas no volume de vendas</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-40 text-red-600">
              {error}
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-5">
                  <div className="grid grid-cols-10 gap-4 pb-2 border-b border-gray-100 items-center">
                    <h3 className="col-span-4 text-sm font-medium text-gray-700">Vendas Mínimas (R$)</h3>
                    <h3 className="col-span-4 text-sm font-medium text-gray-700">Vendas Máximas (R$)</h3>
                    <h3 className="col-span-2 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-1">
                        Comissão (%)
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger type="button">
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">
                                Porcentagem sobre o valor total de vendas na faixa.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </h3>
                    <div className="col-span-1"></div>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-11 gap-4 items-start">
                      <FormField
                        control={form.control}
                        name={`tiers.${index}.minSalesValue`}
                        render={({ field: formField }) => (
                          <FormItem className="col-span-4">
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" {...formField} 
                                className="border-pink-100" 
                                disabled={index > 0}
                                onChange={e => formField.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                value={formField.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`tiers.${index}.maxSalesValue`}
                        render={({ field: formField }) => (
                          <FormItem className="col-span-4">
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="(sem limite)" {...formField} 
                                className="border-pink-100" 
                                disabled={index === fields.length - 1}
                                onChange={e => {
                                  const value = e.target.value === '' ? undefined : Number(e.target.value);
                                  formField.onChange(value);
                                  if (index < fields.length - 1) {
                                    form.setValue(`tiers.${index + 1}.minSalesValue`, value !== undefined ? value + 1 : 0);
                                  }
                                }}
                                value={formField.value ?? ''}
                              />
                            </FormControl>
                             <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`tiers.${index}.commissionPercentage`}
                        render={({ field: formField }) => (
                          <FormItem className="col-span-2">
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="10" {...formField} 
                                className="border-pink-100" 
                                step="0.1"
                                onChange={e => formField.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                value={formField.value ?? ''}
                              />
                            </FormControl>
                             <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <div className="col-span-1 flex items-center h-full">
                        {fields.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeTier(index)} 
                            className="text-red-500 hover:bg-red-100 h-9 w-9 mt-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-start pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addTier}
                    className="border-pink-300 text-pink-600 hover:bg-pink-50"
                  > 
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Faixa
                  </Button>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <Button type="submit" disabled={isSubmitting || !form.formState.isValid} className="bg-pink-600 hover:bg-pink-700 shadow-md">
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Salvar Configurações
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </Tabs>

    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Adicionar Nova Faixa de Comissão</DialogTitle>
                <DialogDescription>
                    Insira o valor mínimo de vendas para iniciar esta nova faixa. O valor máximo da faixa anterior será ajustado automaticamente.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-tier-min" className="text-right">
                        Vendas Mínimas (R$)
                    </Label>
                    <Input 
                        id="new-tier-min" 
                        type="number" 
                        value={newTierMinValue} 
                        onChange={(e) => setNewTierMinValue(e.target.value)} 
                        className="col-span-3 border-pink-100"
                        placeholder="Ex: 1000.01"
                    />
                </div>
            </div>
            <DialogFooter>
                 <DialogClose asChild>
                     <Button type="button" variant="outline">Cancelar</Button>
                 </DialogClose>
                <Button type="button" onClick={handleConfirmAddTier}>Confirmar</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  )
}
