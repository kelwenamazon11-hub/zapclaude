import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus, Trash2, Star, Download } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const statusConfig: Record<string, { label: string; color: string }> = {
  novo: { label: "Novo", color: "text-blue-400" },
  contatado: { label: "Contatado", color: "text-yellow-400" },
  qualificado: { label: "Qualificado", color: "text-primary" },
  convertido: { label: "Convertido", color: "text-green-400" },
  descartado: { label: "Descartado", color: "text-muted-foreground" },
};

export default function Leads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const criarMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("leads").insert({ user_id: user!.id, nome: nome.trim() || null, telefone: telefone.trim() || null, email: email.trim() || null });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead adicionado!" });
      setNome(""); setTelefone(""); setEmail(""); setDialogOpen(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });

  const deletarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead removido" });
    },
  });

  const exportarCSV = () => {
    const header = "Nome,Telefone,Email,Status,Origem,Data\n";
    const rows = leads.map((l) => `"${l.nome || ""}","${l.telefone || ""}","${l.email || ""}","${l.status}","${l.origem || ""}","${new Date(l.created_at).toLocaleDateString("pt-BR")}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leads.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exportado!" });
  };

  const exportarJSON = () => {
    const blob = new Blob([JSON.stringify(leads, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leads.json"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "JSON exportado!" });
  };

  const leadsFiltrados = leads.filter((l) => {
    const matchBusca = (l.nome || "").toLowerCase().includes(busca.toLowerCase()) || (l.telefone || "").includes(busca) || (l.email || "").toLowerCase().includes(busca.toLowerCase());
    const matchStatus = !filtroStatus || l.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              <span className="text-primary glow-text">Leads</span>
            </h1>
            <p className="text-muted-foreground mt-1">{leads.length} leads na base</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportarCSV} className="border-border text-foreground">
              <Download className="w-4 h-4 mr-1" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportarJSON} className="border-border text-foreground">
              <Download className="w-4 h-4 mr-1" /> JSON
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" /> Novo Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle className="text-foreground">Novo Lead</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <Input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} className="bg-secondary border-border" />
                  <Input placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="bg-secondary border-border" />
                  <Input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border" />
                  <Button onClick={() => criarMutation.mutate()} disabled={criarMutation.isPending} className="w-full gradient-primary text-primary-foreground">Adicionar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Input placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} className="bg-secondary border-border flex-1" />
          <div className="flex gap-1 flex-wrap">
            {Object.entries(statusConfig).map(([key, val]) => (
              <button key={key} onClick={() => setFiltroStatus(filtroStatus === key ? null : key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filtroStatus === key ? `${val.color} bg-secondary border border-border` : "text-muted-foreground hover:text-foreground"}`}>
                {val.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : leadsFiltrados.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">Nenhum lead encontrado</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Nome</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Telefone</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Email</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Origem</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {leadsFiltrados.map((lead) => {
                    const config = statusConfig[lead.status] || statusConfig.novo;
                    return (
                      <tr key={lead.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="p-4 text-sm font-medium text-foreground">{lead.nome || "-"}</td>
                        <td className="p-4 text-sm text-muted-foreground font-mono">{lead.telefone || "-"}</td>
                        <td className="p-4 text-sm text-muted-foreground">{lead.email || "-"}</td>
                        <td className="p-4">
                          <select
                            value={lead.status}
                            onChange={(e) => updateStatusMutation.mutate({ id: lead.id, status: e.target.value })}
                            className={`text-xs bg-transparent border-none ${config.color} cursor-pointer`}
                          >
                            {Object.entries(statusConfig).map(([k, v]) => (
                              <option key={k} value={k} className="bg-card text-foreground">{v.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground capitalize">{lead.origem || "-"}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => deletarMutation.mutate(lead.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
