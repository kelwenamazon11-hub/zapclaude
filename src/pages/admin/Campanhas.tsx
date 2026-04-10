import { motion } from "framer-motion";
import { MessageSquare, Eye, Trash2, Play, Pause, StopCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  rascunho: { label: "Rascunho", color: "text-muted-foreground", bg: "bg-secondary" },
  agendada: { label: "Agendada", color: "text-blue-400", bg: "bg-blue-500/10" },
  enviando: { label: "Enviando", color: "text-primary", bg: "bg-primary/10" },
  concluida: { label: "Concluída", color: "text-green-400", bg: "bg-green-500/10" },
  pausada: { label: "Pausada", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  cancelada: { label: "Cancelada", color: "text-red-400", bg: "bg-red-500/10" },
};

export default function Campanhas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: campanhas = [], isLoading } = useQuery({
    queryKey: ["campanhas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("campanhas").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("campanhas").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campanhas"] }),
  });

  const deletarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campanhas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campanhas"] });
      toast({ title: "Campanha excluída" });
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              <span className="text-primary glow-text">Campanhas</span>
            </h1>
            <p className="text-muted-foreground mt-1">{campanhas.length} campanhas no total</p>
          </div>
          <Button onClick={() => navigate("/admin/disparos")} className="gradient-primary text-primary-foreground hover:opacity-90">
            Nova Campanha
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : campanhas.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
            <p className="text-foreground font-medium mb-2">Nenhuma campanha</p>
            <p className="text-sm text-muted-foreground">Crie sua primeira campanha de disparos</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {campanhas.map((camp) => {
              const config = statusConfig[camp.status] || statusConfig.rascunho;
              const progresso = camp.total_contatos > 0 ? (camp.enviados / camp.total_contatos) * 100 : 0;
              return (
                <motion.div key={camp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 hover:border-primary/20 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{camp.nome}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>{config.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {camp.status === "agendada" && (
                        <Button size="icon" variant="ghost" onClick={() => updateStatusMutation.mutate({ id: camp.id, status: "enviando" })} className="text-green-400 hover:text-green-400 hover:bg-green-500/10">
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {camp.status === "enviando" && (
                        <Button size="icon" variant="ghost" onClick={() => updateStatusMutation.mutate({ id: camp.id, status: "pausada" })} className="text-yellow-400 hover:text-yellow-400 hover:bg-yellow-500/10">
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                      {camp.status === "pausada" && (
                        <Button size="icon" variant="ghost" onClick={() => updateStatusMutation.mutate({ id: camp.id, status: "enviando" })} className="text-green-400 hover:text-green-400 hover:bg-green-500/10">
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {["enviando", "pausada"].includes(camp.status) && (
                        <Button size="icon" variant="ghost" onClick={() => updateStatusMutation.mutate({ id: camp.id, status: "cancelada" })} className="text-red-400 hover:text-red-400 hover:bg-red-500/10">
                          <StopCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" onClick={() => deletarMutation.mutate(camp.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span>Delay: {camp.delay_min}-{camp.delay_max}s</span>
                    <span>{camp.enviados}/{camp.total_contatos} enviados</span>
                    {camp.falhas > 0 && <span className="text-red-400">{camp.falhas} falhas</span>}
                  </div>
                  {camp.total_contatos > 0 && <Progress value={progresso} className="h-1.5" />}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
