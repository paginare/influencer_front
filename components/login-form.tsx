"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AlertTriangle, Heart, Loader2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { login } from "@/app/actions/auth"

const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, insira um email válido.",
  }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres.",
  }),
})

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      console.log("Tentando login com:", values.email)
      const result = await login(values.email, values.password)
      
      if (result.success && result.user) {
        console.log("Login bem-sucedido, redirecionando para dashboard")
        
        // Redirecionar com base no perfil do usuário
        switch (result.user.role) {
          case 'admin':
            router.push('/admin/dashboard')
            break
          case 'manager':
            router.push('/manager/dashboard')
            break
          case 'influencer':
            router.push('/influencer/dashboard')
            break
          default:
            router.push('/dashboard')
        }
      } else {
        console.error("Falha no login:", result.message)
        setErrorMessage(result.message || 'Falha ao realizar login. Verifique suas credenciais.')
      }
    } catch (error) {
      console.error('Erro durante login:', error)
      setErrorMessage('Ocorreu um erro no servidor. Tente novamente mais tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-pink-200 shadow-xl animate-fade-in overflow-hidden">
      <CardHeader className="space-y-1 bg-pink-gradient rounded-t-lg pb-6">
        <div className="flex items-center justify-center mb-3">
          <div className="bg-white p-3 rounded-full shadow-md">
            <Heart className="h-10 w-10 text-pink-500" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center text-white font-bold">Influencer Management</CardTitle>
        <CardDescription className="text-center text-pink-50">
          Entre com suas credenciais para acessar o painel
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8 pb-6 px-8">
        {errorMessage && (
          <Alert variant="destructive" className="mb-4 border-red-400 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="seu@email.com"
                      {...field}
                      className="h-11 border-pink-100 focus:border-pink-300 transition-all"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-gray-700">Senha</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-pink-600 hover:text-pink-700 transition-colors"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="******"
                      {...field}
                      className="h-11 border-pink-100 focus:border-pink-300 transition-all"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full h-11 mt-2 bg-pink-600 hover:bg-pink-700 transition-all shadow-md hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
