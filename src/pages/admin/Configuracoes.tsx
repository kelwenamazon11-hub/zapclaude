import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Save } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Configuracoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configs = {} } = useQuery({
    queryKey: ["configuracoes"],
    queryFn: async () => {
      const { data } = await supabase.from("configuracoes").select("*");
      const map: Record<string, string> = {};
      data?.forEach((c) => { map[c.chave] = c.valor || ""; });
      return map;
    },
    enabled: !!user,
  });

  const [delayPadrao, setDelayPadrao] = useState("");
  const [delayMaxPadrao, setDelayMaxPadrao] = useState("");
  const [nomeExibicao, setNomeExibicao] = useState("");

  // Initialize from configs
  const delayMin = delayPadrao || configs["delay_padrao_min"] || "5";
  const delayMax = delayMaxPadrao || configs["delay_padrao_max"] || "15";
  const nome = nomeExibicao || configs["nome_exibicao"] || "";

  const salvarMutation = useMutation({
    mutationFn: async (items: { chave: string; valor: string }[]) => {
      for (const item of items) {
        const { error } = await supabase
          .from("configuracoes")
          .upsert({ user_id: user!.id, chave: item.chave, valor: item.valor }, { onConflict: "user_id,chave" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracoes"] });
      toast({ title: "Configurações salvas!" });
    },
    onError: () => toast({ title: "Erro ao salvar", variant: "destructive" }),
  });

  const handleSalvar = () => {
    salvarMutation.mutate([
      { chave: "delay_padrao_min", valor: delayMin },
      { chave: "delay_padrao_max", valor: delayMax },
      { chave: "nome_exibicao", valor: nome },
    ]);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground">
            <span className="text-primary glow-text">Configurações</span>
          </h1>
          <p className="text-muted-foreground mt-1">Ajustes gerais do sistema</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Perfil</h2>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nome de exibição</label>
            <Input
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNomeExibicao(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            E-mail: <span className="text-foreground">{user?.email}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Disparos</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Delay padrão (segundos)</label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={delayMin}
                  onChange={(e) => setDelayPadrao(e.target.value)}
                  className="bg-secondary border-border w-24"
                  placeholder="Mín"
                />
                <span className="text-muted-foreground">a</span>
                <Input
                  type="number"
                  value={delayMax}
                  onChange={(e) => setDelayMaxPadrao(e.target.value)}
                  className="bg-secondary border-border w-24"
                  placeholder="Máx"
                />
              </div>
              <p className="text-xs text-muted-foreground">Intervalo entre cada mensagem enviada</p>
            </div>
          </div>
        </motion.div>

        <Button
          onClick={handleSalvar}
          disabled={salvarMutation.isPending}
          className="w-full gradient-primary text-primary-foreground hover:opacity-90 font-semibold h-12"
        >
          <Save className="w-4 h-4 mr-2" /> Salvar Configurações
        </Button>
      </div>
    </AppLayout>
  );
}
