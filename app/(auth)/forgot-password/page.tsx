"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Metadata } from "next"
import { requestPasswordResetAction } from "@/app/actions/auth"

const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, insira um email válido.",
  }),
})

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await requestPasswordResetAction(values.email);
      setMessage({ 
        type: result.success ? 'success' : 'error', 
        text: result.message 
      });
      if (result.success) {
        form.reset(); // Clear the form on success
      }
    } catch (error) { // Catch unexpected errors during the action call itself
       console.error("Forgot password submit error:", error);
       setMessage({ 
         type: 'error', 
         text: 'Ocorreu um erro inesperado. Tente novamente mais tarde.' 
       });
    } finally {
       setIsLoading(false);
    }
  }

  return (
    <Card className="border-pink-200 shadow-xl animate-fade-in">
      <CardHeader className="space-y-1 bg-pink-gradient rounded-t-lg pb-6">
        <div className="flex items-center justify-center mb-3">
          <div className="bg-white p-3 rounded-full shadow-md">
            <Mail className="h-10 w-10 text-pink-500" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center text-white font-bold">Recuperar Senha</CardTitle>
        <CardDescription className="text-center text-pink-50">
          Insira seu email para receber instruções
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8 pb-6 px-8">
        {message && (
          <Alert 
            variant={message.type === 'error' ? "destructive" : "default"} 
            className={`mb-4 ${message.type === 'error' ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50'}`}
          >
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.text}
            </AlertDescription>
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
            
            <Button
              type="submit"
              className="w-full h-11 mt-2 bg-pink-600 hover:bg-pink-700 transition-all shadow-md hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Instruções"
              )}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-pink-600 hover:text-pink-700 transition-colors inline-flex items-center text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para o login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
} 