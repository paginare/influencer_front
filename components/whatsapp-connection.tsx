"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Check, Smartphone, Loader2, X, Save, MessageSquare, Plus, Tag, Wifi, WifiOff, QrCode } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { WhatsappQrModal } from "@/components/whatsapp-qr-modal"
import { getConnectionStatus, initiateConnection, connectWhatsapp, getDetailedConnectionStatus, disconnectWhatsapp } from "@/app/actions/whatsapp"
import { updateMessageTemplate } from "@/app/actions/users"

// Define types for message keys and variables
type MessageType = 'welcome' | 'report' | 'reminder';
type MessageData = {
  title: string;
  description: string;
  content: string;
};

export function WhatsappConnection() {
  const [connectionState, setConnectionState] = useState<"loading" | "disconnected" | "connecting" | "connected">("loading")
  const [userToken, setUserToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitiating, setIsInitiating] = useState(false)
  const [qrCodeValue, setQrCodeValue] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<MessageType>("welcome")
  const [isSaving, setIsSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [messages, setMessages] = useState<Record<MessageType, MessageData>>({
    welcome: {
      title: "Mensagem de Boas-vindas",
      description: "Enviada automaticamente quando um novo influencer é cadastrado.",
      content:
        "Olá {nome}! Bem-vindo ao nosso programa de influencers. Estamos muito felizes em ter você conosco! Seu código de cupom é {cupom}. Use-o para compartilhar com seus seguidores.",
    },
    report: {
      title: "Relatório de Vendas",
      description: "Enviado semanalmente com o resumo de vendas e comissões.",
      content:
        "Olá {nome}! Aqui está seu relatório de vendas:\n\nVendas hoje: R$ {valorDiario}\nVendas totais: R$ {valorTotal}\nComissão acumulada: R$ {comissao}\n\nContinue o ótimo trabalho!",
    },
    reminder: {
      title: "Lembretes",
      description: "Enviados para incentivar a divulgação em períodos de baixa atividade.",
      content:
        "Olá {nome}! Notamos que suas vendas estão um pouco abaixo do normal. Que tal compartilhar seu cupom {cupom} novamente com seus seguidores? Seu desempenho atual é de R$ {valorDiario} hoje e R$ {valorTotal} no total.",
    },
  })

  const previewData = {
    nome: "Ana Silva",
    cupom: "ANA10",
    valorDiario: "1.250,00",
    valorTotal: "12.500,00",
    comissao: "1.875,00",
  }

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    async function checkInitialConnectionState() {
      setConnectionState("loading");
      setError(null);
      setQrCodeValue(null);
      
      try {
        // Primeiro verifica se o usuário tem token WhatsApp
        const statusResult = await getConnectionStatus();
        
        if (statusResult.success) {
          if (statusResult.hasToken && statusResult.token) {
            // Usuário tem token, podemos prosseguir com a verificação detalhada
            setUserToken(statusResult.token);
            console.log('Usuário tem token, verificando status detalhado...');
            
            const detailedStatusResult = await getDetailedConnectionStatus();
            
            if (detailedStatusResult.success && detailedStatusResult.status === 'connected') {
              console.log('Status detalhado: Conectado!');
              setConnectionState('connected');
            } else {
              console.log(`Status detalhado: ${detailedStatusResult.status || 'Erro'}. Definindo como Desconectado.`);
              if (!detailedStatusResult.success) {
                  setError(detailedStatusResult.message || "Falha ao verificar status atual da conexão.");
              }
              setConnectionState('disconnected'); 
            }
          } else {
            // Usuário não tem token, não precisa fazer mais consultas
            console.log('Usuário não tem token, estado desconectado.');
            setUserToken(null);
            setConnectionState("disconnected");
          }
        } else {
          console.error('Falha ao buscar status inicial:', statusResult.message);
          setError(statusResult.message || "Falha ao buscar status da conexão.");
          setConnectionState("disconnected");
        }
      } catch (err) {
        console.error("Erro geral no useEffect:", err);
        setError("Erro ao conectar com o servidor.");
        setConnectionState("disconnected");
      } 
    }
    
    checkInitialConnectionState();

    return () => {
      stopPolling();
    };
  }, []);

  const checkDetailedStatus = async () => {
    console.log('Checking detailed status...');
    try {
      const result = await getDetailedConnectionStatus();
      if (result.success) {
        if (result.status === 'connected') {
          console.log('Status UAZapi: Connected!');
          setConnectionState('connected');
          setQrCodeValue(null); 
          stopPolling(); 
          toast({ title: "WhatsApp Conectado!" });
        } else if (result.status === 'connecting') {
          console.log('Status UAZapi: Still connecting.');
          setConnectionState('connecting'); 
          if (result.qrCode) {
             console.log('Updating QR code.');
            setQrCodeValue(result.qrCode); 
          } else {
             console.log('No new QR code received.');
          }
        } else {
          console.log(`Status UAZapi: ${result.status || 'Desconhecido'}, parando polling.`);
          setConnectionState('disconnected'); 
          setError(result.message || `Status inesperado ou erro da API: ${result.status}`);
          stopPolling();
        }
      } else {
        console.error('Falha ao buscar status detalhado (Action Error):', result.message);
      }
    } catch (err) {
      console.error("Erro no checkDetailedStatus (Catch):", err);
    }
  };

  const startPolling = () => {
    stopPolling()
    console.log('Starting polling for detailed status...')
    checkDetailedStatus()
    pollingIntervalRef.current = setInterval(checkDetailedStatus, 7000)
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      console.log('Stopping polling.')
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  const handleConnectClick = async () => {
    setIsInitiating(true)
    setError(null)
    setQrCodeValue(null)
    setShowQrModal(false)
    stopPolling()

    try {
      let result
      if (userToken) {
        console.log('Clicou em Reconectar, chamando connectWhatsapp...')
        result = await connectWhatsapp()
      } else {
        console.log('Clicou em Conectar, chamando initiateConnection...')
        result = await initiateConnection()
      }

      if (result.success && result.token && result.qrCode) {
        setUserToken(result.token)
        setConnectionState("connecting")
        setQrCodeValue(result.qrCode)
        toast({
          title: "Escaneie o QR Code",
          description: "Use o app WhatsApp no seu celular para conectar.",
        })
        startPolling()
      } else {
        setError(result.message || "Falha ao conectar/iniciar a instância.")
        toast({
          title: "Erro",
          description: result.message || "Não foi possível obter o QR Code.",
          variant: "destructive",
        })
        setConnectionState("disconnected")
      }
    } catch (err) {
      console.error("Erro em handleConnectClick:", err)
      setError("Erro ao conectar com o servidor.")
      setConnectionState("disconnected")
      toast({ title: "Erro de Conexão", variant: "destructive" })
    } finally {
      setIsInitiating(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setError(null);
      stopPolling();
      setConnectionState("loading");
      
      const result = await disconnectWhatsapp();
      console.log("Resultado da desconexão:", result);
      
      if (result.success) {
        setConnectionState("disconnected");
        setUserToken(null);
        setQrCodeValue(null);
        toast({ 
          title: "WhatsApp Desconectado", 
          description: result.message || "Sua instância foi desconectada com sucesso." 
        });
      } else {
        let errorMessage = result.message || "Falha ao desconectar instância WhatsApp";
        
        // Adicionar informações de debug se disponíveis
        if (result.debug) {
          console.error("Debug da desconexão:", result.debug);
          errorMessage += ` [Debug: ${JSON.stringify(result.debug)}]`;
        }
        
        setError(errorMessage);
        setConnectionState("disconnected");
        toast({
          title: "Erro",
          description: result.message || "Não foi possível desconectar a instância.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Erro em handleDisconnect:", err);
      setError(`Erro ao desconectar a instância: ${err}`);
      setConnectionState("disconnected");
      toast({ title: "Erro de Conexão", variant: "destructive" });
    }
  }

  const handleSaveMessage = async (type: MessageType) => {
    const currentContent = messages[type].content;
    console.log(`[handleSaveMessage] Saving template for type: ${type}`);
    setIsSaving(true); // Start loading state

    try {
      const result = await updateMessageTemplate(type, currentContent);

      if (result.success) {
        console.log(`[handleSaveMessage] Template ${type} saved successfully.`);
        toast({
          title: "Mensagem salva",
          description: `A mensagem de ${messages[type].title.toLowerCase()} foi salva com sucesso.`,
        });
        // Optionally, update local state if API returns updated data, but not strictly necessary here
        // if (result.updatedTemplate) { ... }
      } else {
        console.error(`[handleSaveMessage] Failed to save template ${type}:`, result.message);
        toast({
          title: "Erro ao Salvar",
          description: result.message || "Não foi possível salvar a mensagem.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`[handleSaveMessage] Network/server error saving template ${type}:`, error);
      toast({
        title: "Erro de Conexão",
        description: "Ocorreu um erro ao tentar salvar a mensagem.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false); // End loading state regardless of outcome
    }
  };

  const insertVariable = (variable: string, type: MessageType) => {
    const textarea = document.getElementById(`message-${type}`) as HTMLTextAreaElement;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBefore = messages[type].content.substring(0, cursorPos);
    const textAfter = messages[type].content.substring(cursorPos);
    const variableToInsert = `{${variable}}`;

    setMessages(prevMessages => ({
      ...prevMessages,
      [type]: {
        ...prevMessages[type],
        content: textBefore + variableToInsert + textAfter,
      },
    }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos + variableToInsert.length, cursorPos + variableToInsert.length);
    }, 0);
  }

  const replaceVariables = (text: string): string => {
    let replacedText = text;
    for (const key in previewData) {
        const regex = new RegExp(`\{${key}\}`, 'g'); 
        replacedText = replacedText.replace(regex, previewData[key as keyof typeof previewData]);
    }
    return replacedText;
  }

  const renderMessageEditor = (type: MessageType) => {
    const messageData = messages[type];
    const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = event.target.value;
        setMessages(prev => ({
            ...prev,
            [type]: { ...prev[type], content: newContent }
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{messageData.title}</CardTitle>
                <CardDescription>{messageData.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {previewMode ? (
                    <div className="prose prose-sm max-w-none rounded-md border bg-muted p-4 whitespace-pre-wrap">
                        {replaceVariables(messageData.content)}
                    </div>
                ) : (
                    <>
                        <Textarea
                            id={`message-${type}`}
                            value={messageData.content}
                            onChange={handleContentChange}
                            rows={6}
                            className="resize-none"
                            placeholder="Digite sua mensagem aqui..."
                        />
                        <div className="flex flex-wrap items-center gap-2">
                            <Label className="text-sm font-medium">Inserir Variável:</Label>
                            {Object.keys(previewData).map((key) => (
                                <Button
                                    key={key}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => insertVariable(key, type)}
                                    className="gap-1 text-xs h-7"
                                >
                                    <Plus className="h-3 w-3" /> {key}
                                </Button>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
            <CardFooter className="justify-between">
                <Button
                    variant="ghost"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="text-sm"
                >
                     {previewMode ? "Voltar a Editar" : "Visualizar"}
                 </Button>
                 <Button onClick={() => handleSaveMessage(type)} disabled={isSaving || previewMode}>
                     {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                     Salvar Mensagem
                 </Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-md overflow-hidden">
        <CardHeader className="bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center">
                <Smartphone className="mr-2 h-5 w-5 text-pink-600" />
                Status da Conexão
              </CardTitle>
              <CardDescription>Gerencie a conexão da sua conta WhatsApp.</CardDescription>
            </div>
            {connectionState === "connected" && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <Wifi className="mr-1 h-3 w-3"/>Conectado
              </Badge>
            )}
            {connectionState === "disconnected" && (
              <Badge variant="secondary">
                <WifiOff className="mr-1 h-3 w-3"/>Desconectado
              </Badge>
            )}
             {connectionState === "connecting" && (
              <Badge variant="outline" className="text-yellow-800 border-yellow-300 bg-yellow-50">
                <Loader2 className="mr-1 h-3 w-3 animate-spin"/>Conectando...
              </Badge>
            )}
            {connectionState === "loading" && (
              <Badge variant="outline">
                <Loader2 className="mr-1 h-3 w-3 animate-spin"/>Verificando...
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {connectionState === "loading" && (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
            </div>
          )}

          {connectionState === "disconnected" && (
             <div className="text-center">
                <p className="text-lg font-medium text-red-700 flex items-center justify-center">
                  <X className="mr-1 h-5 w-5" /> Desconectado
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {userToken
                    ? "A conexão com o WhatsApp foi perdida."
                    : "Você precisa gerar uma conexão para usar o WhatsApp Business API."}
                </p>
                <Button 
                  onClick={handleConnectClick} 
                  disabled={isInitiating}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isInitiating ? (
                     <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Processando...</>
                  ) : userToken ? (
                    <>Reconectar</>
                  ) : (
                    <>Gerar Conexão</>
                  )}
                </Button>
             </div>
          )}

          {connectionState === "connecting" && (
            <div className="text-center space-y-4">
              <p className="text-gray-600">QR Code gerado. Pronto para escanear.</p>
              
              {qrCodeValue ? (
                <div className="flex flex-col items-center">
                  <Button 
                    onClick={() => setShowQrModal(true)} 
                    className="mb-4"
                    variant="default"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Ver QR Code
                  </Button>
                  <Button variant="outline" onClick={handleDisconnect}>Cancelar Conexão</Button>
                </div>
              ) : (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                  <p className="ml-2 text-gray-500">Gerando QR Code...</p>
                </div>
              )}
            </div>
          )}
          
          {connectionState === "connected" && (
             <div className="text-center">
                <p className="text-green-700 mb-4">Sua conta WhatsApp está conectada!</p>
                <Button variant="destructive" onClick={handleDisconnect}>Desconectar</Button>
             </div>
          )}
        </CardContent>
      </Card>

      {connectionState === "connected" && (
        <Card className="shadow-md">
          <CardHeader className="bg-pink-50 rounded-t-lg border-b border-pink-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-pink-500" />
              <CardTitle className="text-xl text-pink-800">Configurações de Mensagens</CardTitle>
            </div>
            <CardDescription>Configure mensagens automáticas para seus influencers</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="welcome" value={activeTab} onValueChange={(value) => setActiveTab(value as MessageType)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-none bg-pink-50">
                <TabsTrigger value="welcome" className="data-[state=active]:bg-white data-[state=active]:text-pink-700 data-[state=active]:shadow-sm">Boas-vindas</TabsTrigger>
                <TabsTrigger value="report" className="data-[state=active]:bg-white data-[state=active]:text-pink-700 data-[state=active]:shadow-sm">Relatório</TabsTrigger>
                <TabsTrigger value="reminder" className="data-[state=active]:bg-white data-[state=active]:text-pink-700 data-[state=active]:shadow-sm">Lembrete</TabsTrigger>
              </TabsList>
              <TabsContent value="welcome" className="p-6">{renderMessageEditor('welcome')}</TabsContent>
              <TabsContent value="report" className="p-6">{renderMessageEditor('report')}</TabsContent>
              <TabsContent value="reminder" className="p-6">{renderMessageEditor('reminder')}</TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <WhatsappQrModal 
        open={showQrModal && !!qrCodeValue && connectionState === 'connecting'} 
        onOpenChange={(isOpen) => { 
          setShowQrModal(isOpen);
          if (!isOpen) setQrCodeValue(null); 
        }}
        progress={0}
        connecting={connectionState === 'connecting'} 
        qrCodeValue={qrCodeValue}
        onCancel={() => { 
          stopPolling();
          setQrCodeValue(null); 
          setConnectionState('disconnected');
          setShowQrModal(false);
        }}
      />
    </div>
  )
}
