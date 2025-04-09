"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Mail, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, insira um email válido.",
  }),
})

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setSubmittedEmail(values.email)
    }, 1500)
  }

  return (
    <Card className="border-pink-200 shadow-xl animate-fade-in overflow-hidden">
      {!isSubmitted ? (
        <>
          <CardHeader className="space-y-1 bg-pink-gradient rounded-t-lg pb-6">
            <CardTitle className="text-2xl text-center text-white font-bold">Recuperar Senha</CardTitle>
            <CardDescription className="text-center text-pink-50">
              Informe seu email para receber um link de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 pb-6 px-8">
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Link de Recuperação
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader className="space-y-1 bg-green-100 rounded-t-lg pb-6">
            <div className="flex justify-center mb-2">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-center text-green-800 font-bold">Email Enviado</CardTitle>
            <CardDescription className="text-center text-green-700">Verifique sua caixa de entrada</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-6 px-8 text-center">
            <p className="text-gray-600 mb-4">Enviamos um link de recuperação para:</p>
            <p className="font-medium text-gray-800 mb-6">{submittedEmail}</p>
            <p className="text-sm text-gray-500">
              Se você não receber o email em alguns minutos, verifique sua pasta de spam ou tente novamente.
            </p>
          </CardContent>
        </>
      )}
    </Card>
  )
}
