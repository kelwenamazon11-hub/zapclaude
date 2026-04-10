import { motion } from "framer-motion";
import { BarChart3, Send, Users, CheckCircle, XCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Relatorios() {
  const { user } = useAuth();

  const { data: campanhas = [] } = useQuery({
    queryKey: ["relatorios-campanhas"],
    queryFn: async () => {
      const { data } = await supabase.from("campanhas").select("*").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: mensagensStats } = useQuery({
    queryKey: ["relatorios-mensagens"],
    queryFn: async () => {
      const { count: total } = await supabase.from("mensagens_enviadas").select("*", { count: "exact", head: true });
      const { count: entregues } = await supabase.from("mensagens_enviadas").select("*", { count: "exact", head: true }).eq("status", "entregue");
      const { count: falhas } = await supabase.from("mensagens_enviadas").select("*", { count: "exact", head: true }).eq("status", "falha");
      return { total: total || 0, entregues: entregues || 0, falhas: falhas || 0 };
    },
    enabled: !!user,
  });

  const { data: contatosCount = 0 } = useQuery({
    queryKey: ["relatorios-contatos"],
    queryFn: async () => {
      const { count } = await supabase.from("contatos").select("*", { count: "exact", head: true });
      return count || 0;
    },
    enabled: !!user,
  });

  const totalEnviados = campanhas.reduce((acc, c) => acc + c.enviados, 0);
  const totalFalhas = campanhas.reduce((acc, c) => acc + c.falhas, 0);
  const taxaEntrega = totalEnviados > 0 ? ((totalEnviados - totalFalhas) / totalEnviados * 100).toFixed(1) : "0";

  return (
    <AppLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground">
            <span className="text-primary glow-text">Relatórios</span>
          </h1>
          <p className="text-muted-foreground mt-1">Métricas e desempenho dos disparos</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Enviados</span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{totalEnviados.toLocaleString("pt-BR")}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm text-muted-foreground">Taxa de Entrega</span>
            </div>
            <p className="text-3xl font-display font-bold text-green-400">{taxaEntrega}%</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-sm text-muted-foreground">Falhas</span>
            </div>
            <p className="text-3xl font-display font-bold text-red-400">{totalFalhas.toLocaleString("pt-BR")}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm text-muted-foreground">Contatos na Base</span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{contatosCount.toLocaleString("pt-BR")}</p>
          </motion.div>
        </div>

        {/* Campanhas Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-display text-lg font-semibold text-foreground">Histórico de Campanhas</h2>
          </div>
          {campanhas.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nenhum dado para exibir</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Campanha</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Enviados</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Falhas</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Taxa</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {campanhas.map((c) => {
                    const taxa = c.enviados > 0 ? ((c.enviados - c.falhas) / c.enviados * 100).toFixed(1) : "-";
                    return (
                      <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="p-4 text-sm font-medium text-foreground">{c.nome}</td>
                        <td className="p-4 text-xs capitalize text-muted-foreground">{c.status}</td>
                        <td className="p-4 text-sm text-foreground">{c.enviados}</td>
                        <td className="p-4 text-sm text-red-400">{c.falhas}</td>
                        <td className="p-4 text-sm text-green-400">{taxa}%</td>
                        <td className="p-4 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("pt-BR")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
