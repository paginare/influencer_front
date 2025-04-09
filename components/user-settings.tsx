"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Save, Lock, User } from "lucide-react"
import { Label } from "@/components/ui/label"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updatePassword, updateProfile } from "@/app/actions/users"

interface UserSettingsProps {
  userData: {
    name: string
    email: string
    role: string
  }
}

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, insira um email válido.",
  }),
})

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(6, {
      message: "A senha atual deve ter pelo menos 6 caracteres.",
    }),
    newPassword: z.string().min(6, {
      message: "A nova senha deve ter pelo menos 6 caracteres.",
    }),
    confirmPassword: z.string().min(6, {
      message: "A confirmação de senha deve ter pelo menos 6 caracteres.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export function UserSettings({ userData }: UserSettingsProps) {
  const router = useRouter()
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false)
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: userData.name,
      email: userData.email,
    },
  })

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    setIsProfileSubmitting(true)
    try {
      console.log("[onProfileSubmit] Calling updateProfile with:", values);
      const result = await updateProfile({
        name: values.name,
        email: values.email,
      });
      console.log("[onProfileSubmit] Result:", result);

      if (result.success) {
        toast({
          title: "Perfil atualizado",
          description: result.message || "Suas informações de perfil foram atualizadas com sucesso.",
        });
        router.refresh();
      } else {
        toast({
          title: "Erro ao atualizar perfil",
          description: result.message || "Não foi possível atualizar as informações.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Profile submit error:", error);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar ao servidor para atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setIsProfileSubmitting(false)
    }
  }

  return (
    <Tabs defaultValue="profile" className="animate-fade-in">
      <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="password">Senha</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card className="shadow-md">
          <CardHeader className="bg-pink-50 rounded-t-lg border-b border-pink-100">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-pink-500" />
              <CardTitle className="text-xl text-pink-800">Informações do Perfil</CardTitle>
            </div>
            <CardDescription>Atualize suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <FormField
                  control={profileForm.control}
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
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} className="border-pink-100" />
                      </FormControl>
                      <FormDescription>Este email será usado para login e comunicações.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="bg-pink-600 hover:bg-pink-700 shadow-md"
                    disabled={isProfileSubmitting}
                  >
                    {isProfileSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="password">
        <Card className="shadow-md">
          <CardHeader className="bg-pink-50 rounded-t-lg border-b border-pink-100">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-pink-500" />
              <CardTitle className="text-xl text-pink-800">Alterar Senha</CardTitle>
            </div>
            <CardDescription>Atualize sua senha para manter sua conta segura</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form 
              action={async (formData: FormData) => { 
                  // Map FormData to the structure expected by updatePassword
                  const data = {
                      currentPassword: formData.get("currentPassword") as string,
                      newPassword: formData.get("newPassword") as string,
                      confirmPassword: formData.get("confirmPassword") as string, 
                  };
                  console.log("[Password Form Action] Mapped data:", data);
                  
                  // Re-validate here before submitting
                  const validationResult = passwordFormSchema.safeParse(data);
                  if (!validationResult.success) {
                      const errors = validationResult.error.flatten().fieldErrors;
                      let errorMsg = "Verifique os campos da senha.";
                      if (errors.currentPassword) errorMsg = errors.currentPassword[0];
                      else if (errors.newPassword) errorMsg = errors.newPassword[0];
                      else if (errors.confirmPassword) errorMsg = errors.confirmPassword[0];
                      else if (validationResult.error.flatten().formErrors.length > 0) errorMsg = validationResult.error.flatten().formErrors[0]; // For refine errors
                      
                      console.log("[Password Form Action] Validation failed:", validationResult.error.flatten());
                      toast({ title: "Erro de Validação", description: errorMsg, variant: "destructive" });
                      return; // Stop submission
                  }
                  
                  setIsPasswordSubmitting(true);
                  try {
                    console.log("[Password Form Action] Calling updatePassword with:", validationResult.data);
                    // Pass validated data
                    const result = await updatePassword({ 
                        currentPassword: validationResult.data.currentPassword,
                        newPassword: validationResult.data.newPassword 
                    });
                    console.log("[Password Form Action] Result:", result);
                    if (result.success) {
                      toast({ title: "Senha atualizada", description: result.message, variant: "default" });
                      // Manually reset plain inputs if needed (or let page refresh handle)
                      (document.getElementById('currentPassword') as HTMLInputElement).value = '';
                      (document.getElementById('newPassword') as HTMLInputElement).value = '';
                      (document.getElementById('confirmPassword') as HTMLInputElement).value = '';
                    } else {
                      toast({ title: "Erro", description: result.message, variant: "destructive" });
                    }
                  } catch (error) {
                    console.error("[Password Form Action] Error:", error);
                    toast({ title: "Erro de Conexão", description: "Falha ao enviar formulário.", variant: "destructive" });
                  } finally {
                      setIsPasswordSubmitting(false);
                  }
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input name="currentPassword" id="currentPassword" type="password" required minLength={6} className="border-pink-100" />
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                 <Label htmlFor="newPassword">Nova Senha</Label>
                 <Input name="newPassword" id="newPassword" type="password" required minLength={6} className="border-pink-100" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input name="confirmPassword" id="confirmPassword" type="password" required minLength={6} className="border-pink-100" />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700 shadow-md"
                  disabled={isPasswordSubmitting}
                >
                  {isPasswordSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Atualizar Senha
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
