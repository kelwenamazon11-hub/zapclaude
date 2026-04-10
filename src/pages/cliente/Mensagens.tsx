import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Edit, Trash2, Copy } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: number;
  nome: string;
  texto: string;
}

const initialTemplates: Template[] = [
  { id: 1, nome: "Boas vindas", texto: "Olá {nome}! 👋 Bem-vindo(a) ao nosso canal. Aqui você receberá as melhores ofertas!" },
  { id: 2, nome: "Promoção", texto: "🔥 {nome}, temos uma oferta especial para você! Desconto de até 50% por tempo limitado. Acesse: {link}" },
  { id: 3, nome: "Lembrete", texto: "Ei {nome}, lembrete rápido: {mensagem}. Qualquer dúvida, estamos aqui! 😊" },
];

export default function Mensagens() {
  const [templates, setTemplates] = useState(initialTemplates);
  const [editando, setEditando] = useState<Template | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [novoTexto, setNovoTexto] = useState("");
  const { toast } = useToast();

  const handleSalvar = () => {
    if (!novoNome.trim() || !novoTexto.trim()) return;
    if (editando) {
      setTemplates(templates.map((t) => (t.id === editando.id ? { ...t, nome: novoNome, texto: novoTexto } : t)));
      toast({ title: "Template atualizado!" });
    } else {
      setTemplates([...templates, { id: Date.now(), nome: novoNome, texto: novoTexto }]);
      toast({ title: "Template criado!" });
    }
    setEditando(null);
    setNovoNome("");
    setNovoTexto("");
  };

  const handleEditar = (t: Template) => {
    setEditando(t);
    setNovoNome(t.nome);
    setNovoTexto(t.texto);
  };

  const handleExcluir = (id: number) => {
    setTemplates(templates.filter((t) => t.id !== id));
    toast({ title: "Template excluído" });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Templates de <span className="text-primary glow-text">Mensagens</span>
          </h1>
          <p className="text-muted-foreground mt-1">Crie e gerencie seus modelos de mensagem</p>
        </motion.div>

        {/* Editor */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {editando ? "Editar Template" : "Novo Template"}
          </h2>
          <Input
            placeholder="Nome do template"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            className="bg-secondary border-border"
          />
          <Textarea
            placeholder="Texto da mensagem. Use {nome}, {link}, {mensagem} como variáveis."
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            className="bg-secondary border-border min-h-[120px]"
          />
          <div className="flex gap-2">
            <Button onClick={handleSalvar} className="gradient-primary text-primary-foreground hover:opacity-90">
              {editando ? "Salvar Alterações" : "Criar Template"}
            </Button>
            {editando && (
              <Button variant="outline" onClick={() => { setEditando(null); setNovoNome(""); setNovoTexto(""); }} className="border-border text-foreground">
                Cancelar
              </Button>
            )}
          </div>
        </motion.div>

        {/* List */}
        <div className="space-y-3">
          {templates.map((t) => (
            <motion.div key={t.id} layout className="glass-card p-5 hover:border-primary/20 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground">{t.nome}</h3>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{t.texto}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleEditar(t)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(t.texto); toast({ title: "Copiado!" }); }}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleExcluir(t.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
