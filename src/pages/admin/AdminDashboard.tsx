import { motion } from "framer-motion";
import { Users, MessageSquare, Send, TrendingUp, Zap, AlertTriangle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/stat-card";

const stats = [
  { title: "Total de Usuários", value: "1.247", icon: Users, trend: { value: 12, positive: true }, subtitle: "Últimos 30 dias" },
  { title: "Campanhas Ativas", value: "38", icon: MessageSquare, trend: { value: 8, positive: true } },
  { title: "Mensagens Enviadas", value: "52.4K", icon: Send, trend: { value: 23, positive: true }, subtitle: "Esta semana" },
  { title: "Taxa de Entrega", value: "96.8%", icon: TrendingUp, trend: { value: 2.1, positive: true } },
];

const recentActivity = [
  { user: "Carlos Silva", action: "Criou campanha", detail: "Promoção Black Friday", time: "Há 5 min" },
  { user: "Ana Oliveira", action: "Importou contatos", detail: "342 números", time: "Há 12 min" },
  { user: "Pedro Santos", action: "Enviou disparo", detail: "1.200 mensagens", time: "Há 30 min" },
  { user: "Maria Costa", action: "Filtrou lista", detail: "Removeu 89 inválidos", time: "Há 1h" },
];

export default function AdminDashboard() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Painel <span className="text-primary glow-text">Administrativo</span>
          </h1>
          <p className="text-muted-foreground mt-1">Visão geral do sistema</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.title} {...stat} index={i} />
          ))}
        </div>

        {/* Activity + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 glass-card p-6"
          >
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">
              Atividade Recente
            </h2>
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.user}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.action} · {item.detail}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Alertas</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <AlertTriangle className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Número aquecendo</p>
                  <p className="text-xs text-muted-foreground">+55 11 9999-0001 em fase de aquecimento</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                <Zap className="w-4 h-4 text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Sistema estável</p>
                  <p className="text-xs text-muted-foreground">Todas as filas processando normalmente</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
