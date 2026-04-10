import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Filter, Trash2, Tag } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockContatos = [
  { id: 1, numero: "+55 11 99999-0001", nome: "João Silva", tag: "lead", status: "ativo" },
  { id: 2, numero: "+55 11 99999-0002", nome: "Maria Santos", tag: "cliente", status: "ativo" },
  { id: 3, numero: "+55 21 98888-0003", nome: "Pedro Oliveira", tag: "lead", status: "inativo" },
  { id: 4, numero: "+55 31 97777-0004", nome: "Ana Costa", tag: "vip", status: "ativo" },
  { id: 5, numero: "+55 41 96666-0005", nome: "Carlos Almeida", tag: "cliente", status: "ativo" },
  { id: 6, numero: "+55 51 95555-0006", nome: "Fernanda Lima", tag: "lead", status: "bloqueado" },
];

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

  const contatosFiltrados = mockContatos.filter((c) => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) || c.numero.includes(busca);
    const matchTag = !filtroTag || c.tag === filtroTag;
    return matchBusca && matchTag;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Meus <span className="text-primary glow-text">Contatos</span>
            </h1>
            <p className="text-muted-foreground mt-1">{mockContatos.length} contatos na base</p>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou número..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <div className="flex gap-2">
            {["lead", "cliente", "vip"].map((tag) => (
              <button
                key={tag}
                onClick={() => setFiltroTag(filtroTag === tag ? null : tag)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors capitalize ${
                  filtroTag === tag ? tagColors[tag] : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
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
                    <td className="p-4 text-sm font-medium text-foreground">{contato.nome}</td>
                    <td className="p-4 text-sm text-muted-foreground font-mono">{contato.numero}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${tagColors[contato.tag]}`}>
                        {contato.tag}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-medium capitalize ${statusColors[contato.status]}`}>
                        ● {contato.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
