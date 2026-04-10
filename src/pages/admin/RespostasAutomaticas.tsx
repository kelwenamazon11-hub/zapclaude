import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Plus, Trash2, Edit, Power, PowerOff } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function RespostasAutomaticas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [palavraChave, setPalavraChave] = useState("");
  const [resposta, setResposta] = useState("");
  const [delay, setDelay] = useState("3");

  const { data: regras = [], isLoading } = useQuery({
    queryKey: ["respostas-automaticas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("respostas_automaticas").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const salvarMutation = useMutation({
    mutationFn: async () => {
      if (editando) {
        const { error } = await supabase.from("respostas_automaticas").update({ palavra_chave: palavraChave, resposta, delay_segundos: parseInt(delay) || 3 }).eq("id", editando);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("respostas_automaticas").insert({ user_id: user!.id, palavra_chave: palavraChave, resposta, delay_segundos: parseInt(delay) || 3 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["respostas-automaticas"] });
      toast({ title: editando ? "Regra atualizada!" : "Regra criada!" });
      resetForm();
    },
    onError: () => toast({ title: "Erro ao salvar", variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from("respostas_automaticas").update({ ativo }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["respostas-automaticas"] }),
  });

  const deletarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("respostas_automaticas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["respostas-automaticas"] });
      toast({ title: "Regra removida" });
    },
  });

  const resetForm = () => {
    setPalavraChave("");
    setResposta("");
    setDelay("3");
    setEditando(null);
    setDialogOpen(false);
  };

  const handleEditar = (regra: any) => {
    setPalavraChave(regra.palavra_chave);
    setResposta(regra.resposta);
    setDelay(String(regra.delay_segundos));
    setEditando(regra.id);
    setDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Respostas <span className="text-primary glow-text">Automáticas</span>
            </h1>
            <p className="text-muted-foreground mt-1">Regras de resposta por palavra-chave</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" /> Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">{editando ? "Editar Regra" : "Nova Regra"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Palavra-chave</label>
                  <Input placeholder="Ex: preço, promoção, oi" value={palavraChave} onChange={(e) => setPalavraChave(e.target.value)} className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Resposta</label>
                  <Textarea placeholder="Mensagem de resposta automática..." value={resposta} onChange={(e) => setResposta(e.target.value)} className="bg-secondary border-border min-h-[100px]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Delay (segundos)</label>
                  <Input type="number" value={delay} onChange={(e) => setDelay(e.target.value)} className="bg-secondary border-border w-24" />
                </div>
                <Button onClick={() => salvarMutation.mutate()} disabled={!palavraChave.trim() || !resposta.trim() || salvarMutation.isPending} className="w-full gradient-primary text-primary-foreground">
                  {editando ? "Salvar Alterações" : "Criar Regra"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : regras.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
            <p className="text-foreground font-medium mb-2">Nenhuma regra configurada</p>
            <p className="text-sm text-muted-foreground">Crie regras para responder automaticamente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {regras.map((regra) => (
              <motion.div key={regra.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">
                        {regra.palavra_chave}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${regra.ativo ? "bg-green-500/10 text-green-400" : "bg-secondary text-muted-foreground"}`}>
                        {regra.ativo ? "Ativo" : "Inativo"}
                      </span>
                      <span className="text-xs text-muted-foreground">{regra.delay_segundos}s delay</span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{regra.resposta}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => toggleMutation.mutate({ id: regra.id, ativo: !regra.ativo })} className={regra.ativo ? "text-green-400 hover:text-green-400" : "text-muted-foreground"}>
                      {regra.ativo ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleEditar(regra)} className="text-muted-foreground hover:text-primary">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deletarMutation.mutate(regra.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
