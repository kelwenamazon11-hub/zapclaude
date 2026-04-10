import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const tagColors: Record<string, string> = {
  lead: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  cliente: "bg-green-500/10 text-green-400 border-green-500/20",
  vip: "bg-primary/10 text-primary border-primary/20",
};

const statusColors: Record<string, string> = {
  ativo: "text-green-400",
  inativo: "text-muted-foreground",
  bloqueado: "text-red-400",
};

export default function Contatos() {
  const [busca, setBusca] = useState("");
  const [filtroTag, setFiltroTag] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contatos = [], isLoading } = useQuery({
    queryKey: ["contatos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contatos").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deletarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contatos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contatos"] });
      toast({ title: "Contato removido" });
    },
  });

  const contatosFiltrados = contatos.filter((c) => {
    const matchBusca = (c.nome || "").toLowerCase().includes(busca.toLowerCase()) || c.numero.includes(busca);
    const matchTag = !filtroTag || c.tag === filtroTag;
    return matchBusca && matchTag;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Meus <span className="text-primary glow-text">Contatos</span>
          </h1>
          <p className="text-muted-foreground mt-1">{contatos.length} contatos na base</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou número..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-10 bg-secondary border-border" />
          </div>
          <div className="flex gap-2">
            {["lead", "cliente", "vip"].map((tag) => (
              <button
                key={tag}
                onClick={() => setFiltroTag(filtroTag === tag ? null : tag)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors capitalize ${
                  filtroTag === tag ? (tagColors[tag] || "") : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : contatosFiltrados.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">Nenhum contato encontrado</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Nome</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Número</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Tag</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contatosFiltrados.map((contato) => (
                    <tr key={contato.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="p-4 text-sm font-medium text-foreground">{contato.nome || "-"}</td>
                      <td className="p-4 text-sm text-muted-foreground font-mono">{contato.numero}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${tagColors[contato.tag || "lead"] || ""}`}>
                          {contato.tag || "lead"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-medium capitalize ${statusColors[contato.status] || ""}`}>● {contato.status}</span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => deletarMutation.mutate(contato.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
