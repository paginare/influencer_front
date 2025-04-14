"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, KeyRound, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { verifyResetTokenAction, resetPasswordAction } from "@/app/actions/auth"

const formSchema = z.object({
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres.",
  }),
  confirmPassword: z.string()
})
.refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"], // path of error
});

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      setMessage({ type: 'error', text: 'Token de redefinição inválido ou ausente.' });
      setIsTokenValid(false);
      setIsVerifying(false);
      return;
    }

    async function verifyToken() {
      setIsVerifying(true);
      setMessage(null);
      const result = await verifyResetTokenAction(token as string);
      if (result.success) {
        setIsTokenValid(true);
      } else {
        setIsTokenValid(false);
        setMessage({ type: 'error', text: result.message || 'Token inválido ou expirado.' });
      }
      setIsVerifying(false);
    }

    verifyToken();
  }, [token]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token || !isTokenValid) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await resetPasswordAction(token, values.password);
      setMessage({ 
        type: result.success ? 'success' : 'error', 
        text: result.message 
      });
      if (result.success) {
        form.reset();
        // Optionally redirect after a delay
        // setTimeout(() => router.push('/login'), 3000);
      }
    } catch (error) {
      console.error("Reset password submit error:", error);
      setMessage({ 
        type: 'error', 
        text: 'Ocorreu um erro inesperado ao redefinir a senha.' 
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-pink-200 shadow-xl animate-fade-in w-full max-w-md">
      <CardHeader className="space-y-1 bg-pink-gradient rounded-t-lg pb-6">
        <div className="flex items-center justify-center mb-3">
          <div className="bg-white p-3 rounded-full shadow-md">
            <KeyRound className="h-10 w-10 text-pink-500" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center text-white font-bold">Redefinir Senha</CardTitle>
        <CardDescription className="text-center text-pink-50">
          Crie uma nova senha para sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8 pb-6 px-8">
        {isVerifying ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
            <p className="ml-3 text-gray-600">Verificando link...</p>
          </div>
        ) : (
          <>
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

            {isTokenValid ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Nova Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
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
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
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
                    disabled={isLoading || !isTokenValid || message?.type === 'success'}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redefinindo...
                      </>
                    ) : (
                      "Redefinir Senha"
                    )}
                  </Button>
                </form>
              </Form>
            ) : null} 

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-pink-600 hover:text-pink-700 transition-colors inline-flex items-center text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar para o login
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Use Suspense to handle client-side search param reading
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
} 