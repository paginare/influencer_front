"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Filter,
  Instagram,
  Copy,
  Check,
  Bell,
  MessageSquare,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { NotificationSettings } from "@/components/notification-settings"
import { 
  getMyInfluencers, 
  createInfluencer, 
  updateInfluencer, 
  deleteInfluencer, 
  checkCouponAvailability, 
  InfluencerData, 
  saveInfluencerNotificationSettings
} from "@/app/actions/manager"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, insira um email válido.",
  }),
  phone: z.string().min(10, {
    message: "Por favor, insira um número de telefone válido.",
  }),
  instagram: z.string().min(3, {
    message: "Por favor, insira um usuário do Instagram válido.",
  }),
  coupon: z.string().min(3, {
    message: "O cupom deve ter pelo menos 3 caracteres.",
  }),
})

// Dados de fallback para testes e desenvolvimento
const fallbackInfluencers = [
  {
    id: "1",
    name: "Ana Silva",
    email: "ana@example.com",
    phone: "(11) 98765-4321",
    instagram: "@anasilva",
    coupon: "ANA10",
    status: "Ativo",
    sales: 12500,
    commission: 1250,
    trend: "+12%",
    notifications: {
      welcome: true,
      report: true,
      reminder: true,
    },
  },
  {
    id: "2",
    name: "Bruno Costa",
    email: "bruno@example.com",
    phone: "(21) 98765-4321",
    instagram: "@brunocosta",
    coupon: "BRUNO15",
    status: "Ativo",
    sales: 10800,
    commission: 1080,
    trend: "+8%",
    notifications: {
      welcome: true,
      report: true,
      reminder: false,
    },
  },
  {
    id: "3",
    name: "Carla Mendes",
    email: "carla@example.com",
    phone: "(31) 98765-4321",
    instagram: "@carlamendes",
    coupon: "CARLA20",
    status: "Ativo",
    sales: 9200,
    commission: 920,
    trend: "+5%",
    notifications: {
      welcome: true,
      report: false,
      reminder: false,
    },
  },
  {
    id: "4",
    name: "Diego Santos",
    email: "diego@example.com",
    phone: "(41) 98765-4321",
    instagram: "@diegosantos",
    coupon: "DIEGO25",
    status: "Inativo",
    sales: 8500,
    commission: 850,
    trend: "+3%",
    notifications: {
      welcome: false,
      report: false,
      reminder: false,
    },
  },
]

// Expandir a interface InfluencerData para incluir informações de notificações
interface InfluencerWithNotifications extends InfluencerData {
  notifications?: {
    welcome: boolean;
    report: boolean;
    reminder: boolean;
  };
}

export function InfluencerManagement() {
  const [influencers, setInfluencers] = useState<InfluencerWithNotifications[]>([])
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [influencerToDelete, setInfluencerToDelete] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null)
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false)
  const [selectedInfluencer, setSelectedInfluencer] = useState<InfluencerWithNotifications | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [influencerToEdit, setInfluencerToEdit] = useState<InfluencerWithNotifications | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [checkedCoupon, setCheckedCoupon] = useState<{ value: string; available: boolean } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      instagram: "",
      coupon: "",
    },
  })

  // Resetar checkedCoupon quando o valor do cupom mudar
  const couponValue = form.watch('coupon');
  useEffect(() => {
    setCheckedCoupon(null);
  }, [couponValue]);

  // Resetar checkedCoupon quando o modal abrir/fechar ou form for resetado
  // (Será adicionado nos onOpenChange e resets)

  // Carregar influencers quando o componente for montado
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

  const handleEditClick = (influencer: InfluencerWithNotifications) => {
    setInfluencerToEdit(influencer)
    form.reset({
      name: influencer.name,
      email: influencer.email,
      phone: influencer.phone || "",
      instagram: influencer.instagram || "",
      coupon: influencer.coupon,
    })
    setEditDialogOpen(true)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      if (influencerToEdit) {
        // Atualiza influencer existente
        const result = await updateInfluencer(influencerToEdit.id, {
          name: values.name,
          email: values.email,
          phone: values.phone,
          instagram: values.instagram,
          coupon: values.coupon,
        })

        if (result.success) {
          toast({
            title: "Influencer atualizado com sucesso",
            description: `As informações de ${values.name} foram atualizadas.`,
          })

          // Atualiza a lista de influencers
          setInfluencers(
            influencers.map((inf) => {
              if (inf.id === influencerToEdit.id) {
                return { ...inf, ...values }
              }
              return inf
            })
          )

          setEditDialogOpen(false)
        } else {
          toast({
            title: "Erro ao atualizar",
            description: result.message || "Ocorreu um erro ao atualizar o influencer.",
            variant: "destructive",
          })
        }
      } else {
        // Cria novo influencer
        console.log("Chamando createInfluencer com:", {
          name: values.name,
          email: values.email,
          whatsappNumber: values.phone,
          coupon: values.coupon,
        }); 
        const result = await createInfluencer({
          name: values.name,
          email: values.email,
          whatsappNumber: values.phone, 
          coupon: values.coupon,
        })

        if (result.success && result.influencer) {
          toast({
            title: "Influencer criado com sucesso",
            description: `${values.name} foi adicionado como influencer com o cupom ${values.coupon}.`,
          })

          // Adiciona o novo influencer à lista
          setInfluencers([...influencers, result.influencer])
          setOpen(false)
        } else {
          toast({
            title: "Erro ao criar",
            description: result.message || "Ocorreu um erro ao criar o influencer.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Erro na função onSubmit:", error);
      toast({
        title: "Erro de Conexão",
        description: "Falha ao enviar dados. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      })
    } finally {
      form.reset()
      setIsSubmitting(false)
      setInfluencerToEdit(null)
      setCheckedCoupon(null);
    }
  }

  const filteredInfluencers = influencers.filter((influencer) => {
    // Filter by search query
    const matchesSearch =
      influencer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      influencer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (influencer.instagram && influencer.instagram.toLowerCase().includes(searchQuery.toLowerCase())) ||
      influencer.coupon.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by tab
    if (activeTab === "all") return matchesSearch
    if (activeTab === "active") return matchesSearch && influencer.status === "Ativo"
    if (activeTab === "inactive") return matchesSearch && influencer.status === "Inativo"

    return matchesSearch
  })

  const handleDeleteClick = (influencerId: string) => {
    setInfluencerToDelete(influencerId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!influencerToDelete) return

    try {
      const result = await deleteInfluencer(influencerToDelete)
      
      if (result.success) {
        // Remove o influencer da lista
        setInfluencers(influencers.filter((inf) => inf.id !== influencerToDelete))
        
        toast({
          title: "Influencer removido",
          description: "O influencer foi removido com sucesso.",
        })
      } else {
        toast({
          title: "Erro ao remover",
          description: result.message || "Ocorreu um erro ao remover o influencer.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao remover influencer:", error)
      toast({
        title: "Erro de Conexão",
        description: "Falha ao remover influencer. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setInfluencerToDelete(null)
    }
  }

  const handleCopyCoupon = (coupon: string) => {
    navigator.clipboard.writeText(coupon)
    setCopiedCoupon(coupon)
    setTimeout(() => {
      setCopiedCoupon(null)
    }, 2000)

    toast({
      title: "Cupom copiado",
      description: `O cupom ${coupon} foi copiado para a área de transferência.`,
    })
  }

  const openNotificationSettings = (influencer: InfluencerWithNotifications) => {
    setSelectedInfluencer(influencer)
    setNotificationDialogOpen(true)
  }

  const updateNotificationSettings = async (influencerId: string, settings: any) => {
    try {
      const result = await saveInfluencerNotificationSettings(influencerId, settings);
      
      if (result.success && result.notifications) {
        // Atualiza o estado local APENAS se o backend confirmar
        setInfluencers(
          influencers.map((influencer) => {
            if (influencer.id === influencerId) {
              return {
                ...influencer,
                notifications: result.notifications, // Usa as configurações retornadas pelo backend
              }
            }
            return influencer
          })
        )
        
        toast({
          title: "Notificações atualizadas",
          description: result.message || "As configurações de notificação foram atualizadas com sucesso.",
        })
        
        setNotificationDialogOpen(false) // Fecha o diálogo após sucesso
      } else {
        // Mostra erro se o backend falhar
        toast({
          title: "Erro ao salvar",
          description: result.message || "Não foi possível salvar as configurações.",
          variant: "destructive",
        })
      }
    } catch (error) {
      // Mostra erro de conexão
      toast({
        title: "Erro de Conexão",
        description: "Falha ao salvar configurações. Verifique sua conexão.",
        variant: "destructive",
      })
      console.error("Erro ao salvar notificações:", error)
    }
    // O estado de 'isSaving' é tratado dentro de NotificationSettings
  }

  const handleCheckCoupon = async (coupon: string) => {
    console.log("handleCheckCoupon FOI CHAMADO com:", coupon);
    setValidatingCoupon(true)
    const couponResult = await checkCouponAvailability(coupon)
    setValidatingCoupon(false)
    
    if (couponResult.success && couponResult.available) {
      setCheckedCoupon({ value: coupon, available: true })
      toast({
        title: "Cupom disponível",
        description: "Este cupom está disponível para uso.",
      })
    } else {
      setCheckedCoupon({ value: coupon, available: false })
      toast({
        title: "Cupom indisponível",
        description: "Este cupom não está disponível para uso.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar influencers..."
            className="pl-8 border-pink-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[260px]">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="inactive">Inativos</TabsTrigger>
            </TabsList>
          </Tabs>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="border-pink-100">
                <Filter className="h-4 w-4 text-pink-800" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Maior venda</DropdownMenuItem>
              <DropdownMenuItem>Menor venda</DropdownMenuItem>
              <DropdownMenuItem>Mais recentes</DropdownMenuItem>
              <DropdownMenuItem>Mais antigos</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) setCheckedCoupon(null); }}>
            <DialogTrigger asChild>
              <Button className="bg-pink-600 hover:bg-pink-700 shadow-md">
                <Plus className="mr-2 h-4 w-4" />
                Novo Influencer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Influencer</DialogTitle>
                <DialogDescription>Preencha os dados para criar um novo influencer.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} className="border-pink-100" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} className="border-pink-100" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} className="border-pink-100" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Instagram className="absolute left-2.5 top-2.5 h-4 w-4 text-pink-500" />
                            <Input {...field} className="pl-8 border-pink-100" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="coupon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cupom</FormLabel>
                        <div className="flex items-center gap-2">
                           <FormControl>
                             <Input {...field} className="border-pink-100" />
                           </FormControl>
                           <Button 
                              type="button" 
                              variant="outline"
                              size="sm"
                              onClick={() => handleCheckCoupon(field.value)}
                              disabled={!field.value || validatingCoupon}
                              className="whitespace-nowrap border-pink-200 text-pink-700 hover:bg-pink-50"
                           >
                             {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar"}
                           </Button>
                        </div>
                        <FormDescription>
                          {checkedCoupon && checkedCoupon.value === field.value ? (
                            <span className={checkedCoupon.available ? 'text-green-600' : 'text-red-600'}>
                              {checkedCoupon.available ? 'Cupom disponível!' : 'Cupom indisponível.'}
                            </span>
                          ) : (
                            'Código único para vendas.'
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      className="bg-pink-600 hover:bg-pink-700" 
                      disabled={isSubmitting || !checkedCoupon?.available || checkedCoupon?.value !== couponValue}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>Criar Influencer</>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-pink-600" />
            </div>
          ) : filteredInfluencers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-pink-50 p-3 rounded-full mb-4">
                <Users className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum influencer encontrado</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                {searchQuery 
                  ? "Tente ajustar sua pesquisa ou limpar os filtros."
                  : "Adicione seu primeiro influencer clicando no botão 'Novo Influencer'."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Influencer</TableHead>
                  <TableHead>Instagram</TableHead>
                  <TableHead>Cupom</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vendas</TableHead>
                  <TableHead>Notificações</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInfluencers.map((influencer) => (
                  <TableRow key={influencer.id} className="hover:bg-pink-50/50 transition-colors">
                    <TableCell>
                       <div className="flex items-center gap-3">
                         <Avatar className="h-9 w-9 border border-pink-100">
                            <AvatarImage src={influencer.avatar || "/placeholder-user.jpg"} alt={influencer.name} />
                            <AvatarFallback className="bg-pink-50 text-pink-700">
                                {influencer.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                            </AvatarFallback>
                         </Avatar>
                         <div>
                            <p className="font-medium">{influencer.name}</p>
                            <p className="text-xs text-gray-500">{influencer.email}</p>
                         </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       {influencer.instagram ? (
                         <a
                           href={`https://instagram.com/${influencer.instagram.replace("@", "")}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center text-pink-700 hover:underline text-xs"
                         >
                           <Instagram className="h-3.5 w-3.5 mr-1" />
                           {influencer.instagram}
                         </a>
                       ) : (
                         <span className="text-xs text-gray-400">N/A</span>
                       )}
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center">
                         <Badge className="bg-pink-100 text-pink-800 mr-2 text-xs">{influencer.coupon}</Badge>
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-6 w-6 rounded-full hover:bg-pink-100"
                           onClick={() => handleCopyCoupon(influencer.coupon)}
                         >
                           {copiedCoupon === influencer.coupon ? (
                             <Check className="h-3 w-3 text-green-600" />
                           ) : (
                             <Copy className="h-3 w-3 text-gray-500" />
                           )}
                         </Button>
                       </div>
                    </TableCell>
                    <TableCell>
                       <span
                         className={`px-2 py-0.5 rounded-full text-xs font-medium ${ influencer.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800" }`}
                       >
                         {influencer.status}
                       </span>
                    </TableCell>
                    <TableCell>R$ {influencer.sales.toLocaleString()}</TableCell>
                    <TableCell>
                       <Button
                         variant="ghost"
                         size="sm"
                         className="flex items-center gap-1 h-8 p-1.5"
                         onClick={() => openNotificationSettings(influencer)}
                       >
                         <Bell className="h-4 w-4 text-pink-600" />
                         <div className="flex -space-x-1">
                           {influencer.notifications?.welcome && (
                             <div className="w-2 h-2 rounded-full bg-green-500 border border-white" title="Boas-vindas ativa"></div>
                           )}
                           {influencer.notifications?.report && (
                             <div className="w-2 h-2 rounded-full bg-blue-500 border border-white" title="Relatório ativo"></div>
                           )}
                           {influencer.notifications?.reminder && (
                             <div className="w-2 h-2 rounded-full bg-yellow-500 border border-white" title="Lembrete ativo"></div>
                           )}
                           {!influencer.notifications?.welcome && !influencer.notifications?.report && !influencer.notifications?.reminder && (
                               <div className="w-2 h-2 rounded-full bg-gray-300 border border-white" title="Nenhuma notificação ativa"></div>
                           )}
                         </div>
                       </Button>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-8 w-8 text-gray-500 hover:text-pink-700"
                         onClick={() => handleEditClick(influencer)}
                       >
                         <Pencil className="h-4 w-4" />
                       </Button>
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-8 w-8 text-gray-500 hover:text-red-700"
                         onClick={() => handleDeleteClick(influencer.id)}
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O influencer será removido permanentemente e todas as suas
              informações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações de Notificação</DialogTitle>
            <DialogDescription>
              Configure as notificações para {selectedInfluencer?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInfluencer && (
            <NotificationSettings
              influencerId={selectedInfluencer.id}
              initialSettings={selectedInfluencer.notifications || { welcome: false, report: false, reminder: false }}
              onSave={updateNotificationSettings}
              onClose={() => setNotificationDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={(isOpen) => { setEditDialogOpen(isOpen); if (!isOpen) setCheckedCoupon(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Influencer</DialogTitle>
            <DialogDescription>Atualize as informações do influencer.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} className="border-pink-100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} className="border-pink-100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} className="border-pink-100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Instagram className="absolute left-2.5 top-2.5 h-4 w-4 text-pink-500" />
                        <Input {...field} className="pl-8 border-pink-100" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coupon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cupom</FormLabel>
                     <div className="flex items-center gap-2">
                        <FormControl>
                          <Input {...field} className="border-pink-100" />
                        </FormControl>
                        <Button 
                           type="button" 
                           variant="outline"
                           size="sm"
                           onClick={() => handleCheckCoupon(field.value)}
                           disabled={!field.value || validatingCoupon || field.value === influencerToEdit?.coupon}
                           className="whitespace-nowrap border-pink-200 text-pink-700 hover:bg-pink-50"
                        >
                          {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar"}
                        </Button>
                     </div>
                     <FormDescription>
                       {checkedCoupon && checkedCoupon.value === field.value ? (
                         <span className={checkedCoupon.available ? 'text-green-600' : 'text-red-600'}>
                           {checkedCoupon.available ? 'Cupom disponível!' : 'Cupom indisponível.'}
                         </span>
                       ) : (
                         influencerToEdit && field.value === influencerToEdit.coupon ? 'Cupom atual.' : 'Verifique a disponibilidade se alterar.'
                       )}
                     </FormDescription>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="bg-pink-600 hover:bg-pink-700" 
                  disabled={
                    isSubmitting || 
                    (couponValue !== influencerToEdit?.coupon && (!checkedCoupon?.available || checkedCoupon?.value !== couponValue))
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>Salvar Alterações</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
