import { useState } from "react";
import { motion } from "framer-motion";
import { Users2, Plus, Trash2, Link, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  ativo: { label: "Ativo", color: "text-green-400", bg: "bg-green-500/10" },
  inativo: { label: "Inativo", color: "text-muted-foreground", bg: "bg-secondary" },
  cheio: { label: "Cheio", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  invalido: { label: "Inválido", color: "text-red-400", bg: "bg-red-500/10" },
};

export default function Grupos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [link, setLink] = useState("");

  const { data: grupos = [], isLoading } = useQuery({
    queryKey: ["grupos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("grupos").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const criarMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("grupos").insert({ user_id: user!.id, nome: nome.trim(), link: link.trim() || null });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos"] });
      toast({ title: "Grupo adicionado!" });
      setNome(""); setLink(""); setDialogOpen(false);
    },
    onError: () => toast({ title: "Erro ao adicionar", variant: "destructive" }),
  });

  const deletarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("grupos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos"] });
      toast({ title: "Grupo removido" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("grupos").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["grupos"] }),
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              <span className="text-primary glow-text">Grupos</span> WhatsApp
            </h1>
            <p className="text-muted-foreground mt-1">{grupos.length} grupos gerenciados</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" /> Adicionar Grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle className="text-foreground">Adicionar Grupo</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <Input placeholder="Nome do grupo" value={nome} onChange={(e) => setNome(e.target.value)} className="bg-secondary border-border" />
                <Input placeholder="Link do grupo (opcional)" value={link} onChange={(e) => setLink(e.target.value)} className="bg-secondary border-border" />
                <Button onClick={() => criarMutation.mutate()} disabled={!nome.trim() || criarMutation.isPending} className="w-full gradient-primary text-primary-foreground">
                  Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : grupos.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Users2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
            <p className="text-foreground font-medium mb-2">Nenhum grupo</p>
            <p className="text-sm text-muted-foreground">Adicione grupos para gerenciar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grupos.map((grupo) => {
              const config = statusConfig[grupo.status] || statusConfig.ativo;
              return (
                <motion.div key={grupo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 hover:border-primary/20 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{grupo.nome}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{grupo.membros} membros</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>{config.label}</span>
                  </div>
                  {grupo.link && (
                    <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-secondary/50 border border-border">
                      <Link className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground truncate font-mono">{grupo.link}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: grupo.id, status: grupo.status === "ativo" ? "inativo" : "ativo" })} className="flex-1 border-border text-foreground text-xs">
                      {grupo.status === "ativo" ? "Desativar" : "Ativar"}
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => deletarMutation.mutate(grupo.id)} className="border-border text-muted-foreground hover:text-destructive hover:border-destructive/50">
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
