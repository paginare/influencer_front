"use client"

import { useState, useEffect, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Plus, Pencil, Trash2, Loader2, Search, Filter, UserCheck, UserX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { getUsers, createUser, updateUser, deleteUser } from "@/app/actions/users"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'influencer';
  whatsappNumber?: string;
  isActive?: boolean;
  createdAt?: Date | string;
  manager?: { _id: string; name: string };
  influencers?: { _id: string; name: string }[];
  couponCode?: string;
}

const formSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres." }).optional().or(z.literal('')),
  role: z.enum(['manager', 'influencer'], { required_error: "Selecione o tipo de usuário." }),
  whatsappNumber: z.string().optional(),
  isActive: z.boolean().default(true),
  managerId: z.string().optional(),
  couponCode: z.string().optional(),
})
.refine((data) => data.role !== 'influencer' || !!data.managerId, {
  message: "Gerente é obrigatório para influenciadores.",
  path: ["managerId"],
})
.refine((data) => data.role !== 'influencer' || !!data.couponCode, {
  message: "Código do cupom é obrigatório para influenciadores.",
  path: ["couponCode"],
});

type UserFormData = z.infer<typeof formSchema>;

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)

  const [managers, setManagers] = useState<{ _id: string; name: string }[]>([])

  const form = useForm<UserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: undefined,
      whatsappNumber: "",
      isActive: true,
      managerId: "",
      couponCode: "",
      _id: undefined,
    },
  })

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (roleFilter) filters.role = roleFilter;
      if (statusFilter) filters.status = statusFilter
      
      const result = await getUsers(filters);
      if (result.success && result.users) {
        setUsers(result.users);
      } else {
        setError(result.message || "Falha ao buscar usuários");
        toast({ variant: "destructive", title: "Erro", description: result.message || "Falha ao buscar usuários" });
      }
    } catch (err) {
      setError("Erro de conexão ao buscar usuários");
      toast({ variant: "destructive", title: "Erro", description: "Erro de conexão ao buscar usuários" });
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, roleFilter, statusFilter])

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers])

  useEffect(() => {
    if (dialogOpen) {
      const fetchManagers = async () => {
        try {
          const result = await getUsers({ role: 'manager' });
          if (result.success && result.users) {
            setManagers(result.users.map(m => ({ _id: m._id, name: m.name })));
          } else {
            console.error("Failed to fetch managers");
          }
        } catch (error) {
          console.error("Error fetching managers:", error);
        }
      };
      fetchManagers();
    }
  }, [dialogOpen]);

  const handleEditClick = (user: User) => {
    setUserToEdit(user);
    form.reset({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role === 'admin' ? undefined : user.role,
      whatsappNumber: user.whatsappNumber || "",
      isActive: user.isActive === undefined ? true : user.isActive,
      managerId: user.manager?._id || "",
      couponCode: user.couponCode || "",
      password: "",
    });
    setDialogOpen(true);
  };

  const handleCreateClick = () => {
    setUserToEdit(null);
    form.reset();
    setDialogOpen(true);
  };

  async function onSubmit(values: UserFormData) {
    setIsSubmitting(true);
    try {
      let result;
      const userData = { ...values };
      if (userToEdit && !userData.password) {
        delete userData.password;
      }
      if (userData.role !== 'influencer') {
          delete userData.managerId;
          delete userData.couponCode;
      }

      if (userToEdit) {
        result = await updateUser(userToEdit._id, userData);
      } else {
        if (!userData.password) {
           toast({ variant: "destructive", title: "Erro", description: "Senha é obrigatória para criar usuário." });
           setIsSubmitting(false);
           return;
        }
        if (!userData.role) {
          toast({ variant: "destructive", title: "Erro", description: "Tipo de usuário é obrigatório." });
          setIsSubmitting(false);
          return;
        }
        result = await createUser(userData as Omit<User, '_id' | 'createdAt'>);
      }

      if (result.success) {
        toast({
          title: userToEdit ? "Usuário Atualizado" : "Usuário Criado",
          description: `${values.name} foi ${userToEdit ? 'atualizado' : 'criado'} com sucesso.`,
        });
        setDialogOpen(false);
        setUserToEdit(null);
        fetchUsers();
      } else {
        toast({ variant: "destructive", title: "Erro", description: result.message || "Falha ao salvar usuário" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro de Conexão", description: "Não foi possível conectar ao servidor." });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsSubmitting(true);
    try {
      const result = await deleteUser(userToDelete._id);
      if (result.success) {
        toast({
          title: "Usuário Removido",
          description: `O usuário ${userToDelete.name} foi removido com sucesso.`,
        });
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        fetchUsers();
      } else {
        toast({ variant: "destructive", title: "Erro", description: result.message || "Falha ao remover usuário" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro de Conexão", description: "Não foi possível conectar ao servidor." });
    } finally {
      setIsSubmitting(false);
      setDeleteDialogOpen(false);
    }
  };

  const selectedRole = form.watch("role");

  // Calculate filtered users based on search and filters
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = user.name.toLowerCase().includes(searchLower);
    const emailMatch = user.email.toLowerCase().includes(searchLower);
    const couponMatch = user.couponCode?.toLowerCase().includes(searchLower) || false;

    const roleMatch = !roleFilter || roleFilter === 'all-roles' || user.role === roleFilter;
    const statusMatch = !statusFilter || statusFilter === 'all-statuses' || (statusFilter === 'active' && user.isActive) || (statusFilter === 'inactive' && !user.isActive);

    return (nameMatch || emailMatch || couponMatch) && roleMatch && statusMatch;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, email, cupom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-pink-100"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
           <Select value={roleFilter} onValueChange={setRoleFilter} disabled={isLoading}>
            <SelectTrigger className="w-[180px] border-pink-100">
                <SelectValue placeholder="Filtrar por Tipo" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all-roles">Todos Tipos</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="influencer">Influenciador</SelectItem>
            </SelectContent>
           </Select>
           <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoading}>
            <SelectTrigger className="w-[180px] border-pink-100">
                <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all-statuses">Todos Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
           </Select>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateClick} className="bg-pink-600 hover:bg-pink-700 shadow-md">
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>{userToEdit ? "Editar Usuário" : "Adicionar Novo Usuário"}</DialogTitle>
                <DialogDescription>
                  {userToEdit ? `Edite as informações de ${userToEdit.name}.` : "Preencha os dados para criar uma nova conta."}
                </DialogDescription>
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
                          <Input placeholder="Nome completo" {...field} className="border-pink-100" />
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
                          <Input type="email" placeholder="email@exemplo.com" {...field} className="border-pink-100" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha {userToEdit ? "(Opcional)" : ""}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={userToEdit ? "Deixe em branco para não alterar" : "******"} {...field} className="border-pink-100" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(XX) 9XXXX-XXXX" {...field} className="border-pink-100" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Usuário</FormLabel>
                         <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value} 
                            disabled={!!userToEdit}
                         >
                          <FormControl>
                            <SelectTrigger className="border-pink-100">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manager">Gerente</SelectItem>
                            <SelectItem value="influencer">Influenciador</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {selectedRole === 'influencer' && (
                    <>
                       <FormField
                        control={form.control}
                        name="managerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gerente Responsável</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-pink-100">
                                  <SelectValue placeholder="Selecione o gerente" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {managers.length === 0 && <SelectItem value="no-manager-placeholder" disabled>Nenhum gerente encontrado</SelectItem>}
                                {managers.map(manager => (
                                    <SelectItem key={manager._id} value={manager._id}>{manager.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="couponCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código do Cupom</FormLabel>
                            <FormControl>
                              <Input placeholder="CUPOM10" {...field} className="border-pink-100" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                   <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm border-pink-100">
                        <div className="space-y-0.5">
                          <FormLabel>Status Ativo</FormLabel>
                          <FormMessage />
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700">
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {userToEdit ? "Salvar Alterações" : "Criar Usuário"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-pink-100">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-pink-500" />
                  </TableCell>
                </TableRow>
              ) : error ? (
                 <TableRow>
                  <TableCell colSpan={5} className="text-center text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                 <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    Nenhum usuário encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                       <Badge variant={user.role === 'manager' ? "secondary" : user.role === 'influencer' ? "outline" : "default"}
                              className={user.role === 'manager' ? "bg-blue-100 text-blue-800" :
                                         user.role === 'influencer' ? "bg-green-100 text-green-800" :
                                         "bg-gray-100 text-gray-800"}
                       >
                           {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                       </Badge>
                    </TableCell>
                     <TableCell>
                      {user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '--'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)} className="hover:bg-pink-50">
                        <Pencil className="h-4 w-4 text-pink-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(user)} className="hover:bg-red-50">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o usuário "{userToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
            >
               {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
