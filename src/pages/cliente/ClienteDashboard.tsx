import { motion } from "framer-motion";
import { Send, Users, MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const stats = [
  { title: "Mensagens Enviadas", value: "8.432", icon: Send, trend: { value: 15, positive: true }, subtitle: "Este mês" },
  { title: "Contatos", value: "2.156", icon: Users, trend: { value: 5, positive: true } },
  { title: "Campanhas", value: "12", icon: MessageSquare },
  { title: "Taxa de Entrega", value: "94.2%", icon: CheckCircle, trend: { value: 1.8, positive: true } },
];

const campanhasRecentes = [
  { nome: "Promo Natal", status: "enviando", progresso: 67, total: 1500, enviados: 1005 },
  { nome: "Boas Vindas", status: "concluida", progresso: 100, total: 340, enviados: 340 },
  { nome: "Reengajamento", status: "agendada", progresso: 0, total: 820, enviados: 0 },
];

const statusConfig = {
  enviando: { label: "Enviando", color: "text-primary", bg: "bg-primary/10" },
  concluida: { label: "Concluída", color: "text-green-400", bg: "bg-green-500/10" },
  agendada: { label: "Agendada", color: "text-muted-foreground", bg: "bg-secondary" },
};

export default function ClienteDashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Meus <span className="text-primary glow-text">Disparos</span>
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie suas campanhas e contatos</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/cliente/importar")}
              variant="outline"
              className="border-border text-foreground hover:bg-secondary"
            >
              Importar Contatos
            </Button>
            <Button
              onClick={() => navigate("/cliente/disparos")}
              className="gradient-primary text-primary-foreground hover:opacity-90"
            >
              <Send className="w-4 h-4 mr-2" />
              Novo Disparo
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.title} {...stat} index={i} />
          ))}
        </div>

        {/* Campanhas Recentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            Campanhas Recentes
          </h2>
          <div className="space-y-4">
            {campanhasRecentes.map((camp, i) => {
              const config = statusConfig[camp.status as keyof typeof statusConfig];
              return (
                <div key={i} className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/20 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-foreground">{camp.nome}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {camp.enviados}/{camp.total}
                    </span>
                  </div>
                  <Progress value={camp.progresso} className="h-2" />
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
