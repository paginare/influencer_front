"use client"
import { QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WhatsappQrModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  progress: number
  connecting: boolean
  onCancel: () => void
  qrCodeValue?: string | null
}

export function WhatsappQrModal({ open, onOpenChange, progress, connecting, onCancel, qrCodeValue }: WhatsappQrModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar WhatsApp</DialogTitle>
          <DialogDescription>Escaneie o QR code abaixo com seu WhatsApp para conectar sua conta</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-6 p-6">
          {connecting && progress > 0 ? (
            <div className="w-full max-w-md space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Conectando...</span>
                <span className="text-sm font-medium text-pink-600">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-center text-sm text-gray-500 mt-4">
                {progress < 40
                  ? "Iniciando conexão com WhatsApp..."
                  : progress < 80
                    ? "Aguardando confirmação do dispositivo..."
                    : "Finalizando configuração..."}
              </div>
            </div>
          ) : (
            <>
              <div className="border border-pink-200 p-6 rounded-lg bg-white shadow-md">
                {qrCodeValue ? (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <img src={qrCodeValue} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
                  </div>
                ) : (
                  <div className="relative w-64 h-64 flex items-center justify-center">
                    <QrCode className="h-full w-full text-pink-800" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white p-2 rounded-md">
                        <img src="/placeholder.svg?height=180&width=180" alt="QR Code" className="w-44 h-44" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-gray-700">Escaneie o código QR com seu WhatsApp</p>
                <p className="text-xs text-gray-500">
                  1. Abra o WhatsApp no seu celular
                  <br />
                  2. Toque em Menu ou Configurações
                  <br />
                  3. Selecione WhatsApp Web
                  <br />
                  4. Aponte seu celular para esta tela
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
