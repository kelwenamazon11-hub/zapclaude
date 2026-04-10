import { motion } from "framer-motion";
import { Send, Users, MessageSquare, CheckCircle, Smartphone } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: contatosCount = 0 } = useQuery({
    queryKey: ["contatos-count"],
    queryFn: async () => {
      const { count } = await supabase.from("contatos").select("*", { count: "exact", head: true });
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: campanhas = [] } = useQuery({
    queryKey: ["campanhas-recentes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("campanhas")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: instancias = [] } = useQuery({
    queryKey: ["instancias-count"],
    queryFn: async () => {
      const { data } = await supabase.from("instancias").select("*");
      return data || [];
    },
    enabled: !!user,
  });

  const { data: mensagensCount = 0 } = useQuery({
    queryKey: ["mensagens-count"],
    queryFn: async () => {
      const { count } = await supabase.from("mensagens_enviadas").select("*", { count: "exact", head: true });
      return count || 0;
    },
    enabled: !!user,
  });

  const campanhasAtivas = campanhas.filter((c) => c.status === "enviando" || c.status === "agendada").length;
  const instanciasConectadas = instancias.filter((i) => i.status === "conectado").length;

  const stats = [
    { title: "Mensagens Enviadas", value: mensagensCount.toLocaleString("pt-BR"), icon: Send },
    { title: "Contatos", value: contatosCount.toLocaleString("pt-BR"), icon: Users },
    { title: "Campanhas Ativas", value: campanhasAtivas, icon: MessageSquare },
    { title: "Instâncias", value: `${instanciasConectadas}/${instancias.length}`, icon: Smartphone, subtitle: "Conectadas" },
  ];

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    enviando: { label: "Enviando", color: "text-primary", bg: "bg-primary/10" },
    concluida: { label: "Concluída", color: "text-green-400", bg: "bg-green-500/10" },
    agendada: { label: "Agendada", color: "text-blue-400", bg: "bg-blue-500/10" },
    rascunho: { label: "Rascunho", color: "text-muted-foreground", bg: "bg-secondary" },
    pausada: { label: "Pausada", color: "text-yellow-400", bg: "bg-yellow-500/10" },
    cancelada: { label: "Cancelada", color: "text-red-400", bg: "bg-red-500/10" },
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              <span className="text-primary glow-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-1">Visão geral do sistema</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/admin/instancias")}
              variant="outline"
              className="border-border text-foreground hover:bg-secondary"
            >
              <Smartphone className="w-4 h-4 mr-2" /> Instâncias
            </Button>
            <Button
              onClick={() => navigate("/admin/disparos")}
              className="gradient-primary text-primary-foreground hover:opacity-90"
            >
              <Send className="w-4 h-4 mr-2" /> Novo Disparo
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.title} {...stat} index={i} />
          ))}
        </div>

        {/* Últimas Campanhas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            Últimas Campanhas
          </h2>
          {campanhas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nenhuma campanha criada ainda</p>
              <Button
                onClick={() => navigate("/admin/disparos")}
                variant="ghost"
                className="mt-3 text-primary hover:text-primary hover:bg-primary/10"
              >
                Criar primeira campanha
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {campanhas.map((camp) => {
                const config = statusConfig[camp.status] || statusConfig.rascunho;
                return (
                  <div key={camp.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-foreground">{camp.nome}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {camp.enviados}/{camp.total_contatos} enviados
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
