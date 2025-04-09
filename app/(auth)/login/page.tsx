import { LoginForm } from "@/components/login-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | Influencer Hub",
  description: "Faça login para acessar o painel de controle da plataforma Influencer Hub",
}

export default function LoginPage() {
  return <LoginForm />
} 