import { motion } from "framer-motion";
import { Flame, Play, Pause, Plus, Settings } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Aquecimento() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: instancias = [] } = useQuery({
    queryKey: ["instancias"],
    queryFn: async () => {
      const { data } = await supabase.from("instancias").select("*");
      return data || [];
    },
    enabled: !!user,
  });

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["aquecimento"],
    queryFn: async () => {
      const { data, error } = await supabase.from("aquecimento").select("*, instancias(nome, numero)");
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const criarMutation = useMutation({
    mutationFn: async (instanciaId: string) => {
      const { error } = await supabase.from("aquecimento").insert({ user_id: user!.id, instancia_id: instanciaId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aquecimento"] });
      toast({ title: "Aquecimento configurado!" });
    },
    onError: () => toast({ title: "Erro", variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from("aquecimento").update({ ativo }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aquecimento"] });
      toast({ title: "Status atualizado" });
    },
  });

  const instanciasSemAquecimento = instancias.filter(
    (i) => !configs.some((c) => c.instancia_id === i.id)
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground">
            <span className="text-primary glow-text">Aquecimento</span> de Contas
          </h1>
          <p className="text-muted-foreground mt-1">Simule comportamento humano para evitar bloqueios</p>
        </motion.div>

        {/* Explicação */}
        <div className="glass-card p-5 border-primary/20">
          <div className="flex items-start gap-3">
            <Flame className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Como funciona o aquecimento?</p>
              <p className="text-xs text-muted-foreground mt-1">
                O sistema envia mensagens progressivamente ao longo dos dias, começando devagar e aumentando gradualmente. Isso simula um uso humano natural e reduz o risco de bloqueio da conta.
              </p>
            </div>
          </div>
        </div>

        {/* Instâncias disponíveis */}
        {instanciasSemAquecimento.length > 0 && (
          <div className="glass-card p-5">
            <h2 className="text-sm font-medium text-foreground mb-3">Adicionar aquecimento</h2>
            <div className="flex flex-wrap gap-2">
              {instanciasSemAquecimento.map((inst) => (
                <Button key={inst.id} variant="outline" size="sm" onClick={() => criarMutation.mutate(inst.id)} className="border-border text-foreground hover:border-primary/50">
                  <Plus className="w-3 h-3 mr-1" /> {inst.nome}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Configs */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : configs.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Flame className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
            <p className="text-foreground font-medium mb-2">Nenhum aquecimento ativo</p>
            <p className="text-sm text-muted-foreground">
              {instancias.length === 0 ? "Crie uma instância primeiro" : "Adicione aquecimento a uma instância"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configs.map((config) => {
              const progresso = config.dias_total > 0 ? (config.dia_atual / config.dias_total) * 100 : 0;
              const instNome = (config as any).instancias?.nome || "Instância";
              return (
                <motion.div key={config.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 hover:border-primary/20 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{instNome}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Dia {config.dia_atual} de {config.dias_total}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${config.ativo ? "bg-green-500/10 text-green-400" : "bg-secondary text-muted-foreground"}`}>
                      {config.ativo ? "Ativo" : "Pausado"}
                    </span>
                  </div>

                  <Progress value={progresso} className="h-2 mb-4" />

                  <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <p className="text-lg font-bold text-foreground">{config.mensagens_por_dia}</p>
                      <p className="text-[10px] text-muted-foreground">msgs/dia</p>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <p className="text-lg font-bold text-foreground">{config.delay_min}s</p>
                      <p className="text-[10px] text-muted-foreground">delay mín</p>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <p className="text-lg font-bold text-foreground">{config.delay_max}s</p>
                      <p className="text-[10px] text-muted-foreground">delay máx</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => toggleMutation.mutate({ id: config.id, ativo: !config.ativo })}
                    variant="outline"
                    className={`w-full border-border ${config.ativo ? "text-yellow-400 hover:text-yellow-400" : "text-green-400 hover:text-green-400"}`}
                  >
                    {config.ativo ? <><Pause className="w-4 h-4 mr-2" /> Pausar</> : <><Play className="w-4 h-4 mr-2" /> Iniciar</>}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
