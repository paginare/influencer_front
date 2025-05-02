"use client"

import { useState } from "react"
import { Check, MessageSquare, Calendar, AlertTriangle, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface NotificationSettingsProps {
  influencerId: string;
  initialSettings: {
    welcome: boolean;
    report: boolean;
    reminder: boolean;
    sales?: boolean;
  };
  onSave: (influencerId: string, settings: any) => void;
  onClose: () => void;
}

export function NotificationSettings({ influencerId, initialSettings, onSave, onClose }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    welcome: initialSettings.welcome,
    report: initialSettings.report,
    reminder: initialSettings.reminder,
    sales: initialSettings.sales !== undefined ? initialSettings.sales : true,
    reportFrequency: "weekly",
    reminderThreshold: "3days",
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)

    setTimeout(() => {
      setIsSaving(false)
      onSave(influencerId, {
        welcome: settings.welcome,
        report: settings.report,
        reminder: settings.reminder,
        sales: settings.sales,
        reportFrequency: settings.reportFrequency,
        reminderThreshold: settings.reminderThreshold,
      })
    }, 1000)
  }

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        {/* Boas-vindas */}
        <div className="flex items-start space-x-4 p-4 rounded-lg bg-pink-50 border border-pink-100">
          <div className="mt-0.5">
            <div className="bg-pink-100 p-2 rounded-full">
              <MessageSquare className="h-5 w-5 text-pink-600" />
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-pink-900">Mensagem de Boas-vindas</h4>
                <p className="text-sm text-pink-700">Enviada quando o influencer é cadastrado</p>
              </div>
              <Switch
                checked={settings.welcome}
                onCheckedChange={(checked) => setSettings({ ...settings, welcome: checked })}
              />
            </div>
            {settings.welcome && (
              <div className="mt-3 text-xs text-pink-600 bg-pink-100/50 p-2 rounded">
                <p>
                  <Check className="inline-block h-3 w-3 mr-1" />
                  Será enviada uma única vez quando o influencer for cadastrado
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Relatório */}
        <div className="flex items-start space-x-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
          <div className="mt-0.5">
            <div className="bg-blue-100 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Relatório de Vendas</h4>
                <p className="text-sm text-blue-700">Resumo periódico de vendas e comissões</p>
              </div>
              <Switch
                checked={settings.report}
                onCheckedChange={(checked) => setSettings({ ...settings, report: checked })}
              />
            </div>
            {settings.report && (
              <div className="mt-3 grid gap-3">
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label htmlFor="report-frequency" className="text-sm text-blue-700">
                    Frequência de envio:
                  </Label>
                  <Select
                    value={settings.reportFrequency}
                    onValueChange={(value) => setSettings({ ...settings, reportFrequency: value })}
                  >
                    <SelectTrigger id="report-frequency" className="bg-white border-blue-200">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="biweekly">Quinzenal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-xs text-blue-600 bg-blue-100/50 p-2 rounded">
                  <p>
                    <Check className="inline-block h-3 w-3 mr-1" />
                    Inclui dados de vendas, comissões e comparativo com períodos anteriores
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lembretes */}
        <div className="flex items-start space-x-4 p-4 rounded-lg bg-amber-50 border border-amber-100">
          <div className="mt-0.5">
            <div className="bg-amber-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-amber-900">Lembretes de Atividade</h4>
                <p className="text-sm text-amber-700">Enviados em períodos de baixa atividade</p>
              </div>
              <Switch
                checked={settings.reminder}
                onCheckedChange={(checked) => setSettings({ ...settings, reminder: checked })}
              />
            </div>
            {settings.reminder && (
              <div className="mt-3 grid gap-3">
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label htmlFor="reminder-threshold" className="text-sm text-amber-700">
                    Enviar após:
                  </Label>
                  <Select
                    value={settings.reminderThreshold}
                    onValueChange={(value) => setSettings({ ...settings, reminderThreshold: value })}
                  >
                    <SelectTrigger id="reminder-threshold" className="bg-white border-amber-200">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3days">3 dias sem vendas</SelectItem>
                      <SelectItem value="5days">5 dias sem vendas</SelectItem>
                      <SelectItem value="7days">7 dias sem vendas</SelectItem>
                      <SelectItem value="14days">14 dias sem vendas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-xs text-amber-600 bg-amber-100/50 p-2 rounded">
                  <p>
                    <Check className="inline-block h-3 w-3 mr-1" />
                    Incentiva o influencer a divulgar seu cupom para aumentar as vendas
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notificações de Venda */}
        <div className="flex items-start space-x-4 p-4 rounded-lg bg-green-50 border border-green-100">
          <div className="mt-0.5">
            <div className="bg-green-100 p-2 rounded-full">
              <Check className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-900">Notificações de Venda</h4>
                <p className="text-sm text-green-700">Enviadas em tempo real quando ocorrer uma venda</p>
              </div>
              <Switch
                checked={settings.sales}
                onCheckedChange={(checked) => setSettings({ ...settings, sales: checked })}
              />
            </div>
            {settings.sales && (
              <div className="mt-3 text-xs text-green-600 bg-green-100/50 p-2 rounded">
                <p>
                  <Check className="inline-block h-3 w-3 mr-1" />
                  O influencer será notificado imediatamente quando uma venda for registrada usando seu cupom
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button className="bg-pink-600 hover:bg-pink-700" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Configurações"
          )}
        </Button>
      </DialogFooter>
    </div>
  )
}
