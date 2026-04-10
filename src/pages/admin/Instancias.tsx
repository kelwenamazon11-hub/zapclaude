import { useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, Plus, Wifi, WifiOff, QrCode, Trash2, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Instancias() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [novoNome, setNovoNome] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: instancias = [], isLoading } = useQuery({
    queryKey: ["instancias"],
    queryFn: async () => {
      const { data, error } = await supabase.from("instancias").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const criarMutation = useMutation({
    mutationFn: async (nome: string) => {
      const { error } = await supabase.from("instancias").insert({ nome, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instancias"] });
      toast({ title: "Instância criada!" });
      setNovoNome("");
      setDialogOpen(false);
    },
    onError: () => toast({ title: "Erro ao criar instância", variant: "destructive" }),
  });

  const deletarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("instancias").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instancias"] });
      toast({ title: "Instância removida" });
    },
  });

  const conectarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("instancias").update({ status: "aguardando_qr", qr_code: "DEMO_QR_CODE_" + Date.now() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instancias"] });
      toast({ title: "QR Code gerado!", description: "Escaneie com seu WhatsApp." });
    },
  });

  const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    conectado: { label: "Conectado", color: "text-green-400", bg: "bg-green-500/10", icon: Wifi },
    desconectado: { label: "Desconectado", color: "text-muted-foreground", bg: "bg-secondary", icon: WifiOff },
    aguardando_qr: { label: "Aguardando QR", color: "text-primary", bg: "bg-primary/10", icon: QrCode },
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              <span className="text-primary glow-text">Instâncias</span> WhatsApp
            </h1>
            <p className="text-muted-foreground mt-1">Conecte seus números de WhatsApp</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" /> Nova Instância
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Nova Instância</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  placeholder="Nome da instância (ex: Número Principal)"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="bg-secondary border-border"
                />
                <Button
                  onClick={() => novoNome.trim() && criarMutation.mutate(novoNome.trim())}
                  disabled={!novoNome.trim() || criarMutation.isPending}
                  className="w-full gradient-primary text-primary-foreground"
                >
                  Criar Instância
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : instancias.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
            <Smartphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
            <p className="text-foreground font-medium mb-2">Nenhuma instância</p>
            <p className="text-sm text-muted-foreground">Crie uma instância para conectar seu WhatsApp</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instancias.map((inst) => {
              const config = statusConfig[inst.status] || statusConfig.desconectado;
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={inst.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{inst.nome}</h3>
                      {inst.numero && <p className="text-sm text-muted-foreground font-mono mt-1">{inst.numero}</p>}
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${config.bg} ${config.color}`}>
                      <StatusIcon className="w-3 h-3" /> {config.label}
                    </span>
                  </div>

                  {inst.status === "aguardando_qr" && (
                    <div className="mb-4 p-6 rounded-lg bg-secondary/50 border border-border text-center">
                      <QrCode className="w-24 h-24 mx-auto text-primary animate-pulse-glow" />
                      <p className="text-sm text-muted-foreground mt-3">
                        Escaneie o QR Code com seu WhatsApp
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        WhatsApp → Aparelhos conectados → Conectar aparelho
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {inst.status === "desconectado" && (
                      <Button
                        onClick={() => conectarMutation.mutate(inst.id)}
                        disabled={conectarMutation.isPending}
                        className="flex-1 gradient-primary text-primary-foreground hover:opacity-90"
                      >
                        <QrCode className="w-4 h-4 mr-2" /> Gerar QR Code
                      </Button>
                    )}
                    {inst.status === "aguardando_qr" && (
                      <Button
                        onClick={() => conectarMutation.mutate(inst.id)}
                        variant="outline"
                        className="flex-1 border-border text-foreground"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" /> Atualizar QR
                      </Button>
                    )}
                    <Button
                      onClick={() => deletarMutation.mutate(inst.id)}
                      variant="outline"
                      size="icon"
                      className="border-border text-muted-foreground hover:text-destructive hover:border-destructive/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
