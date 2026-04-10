import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Clock, Plus, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Mensagem {
  id: number;
  texto: string;
}

export default function Disparos() {
  const [nomeCampanha, setNomeCampanha] = useState("");
  const [mensagens, setMensagens] = useState<Mensagem[]>([{ id: 1, texto: "" }]);
  const [delayMin, setDelayMin] = useState("5");
  const [delayMax, setDelayMax] = useState("15");
  const [enviando, setEnviando] = useState(false);
  const { toast } = useToast();

  const addMensagem = () => {
    setMensagens([...mensagens, { id: Date.now(), texto: "" }]);
  };

  const removeMensagem = (id: number) => {
    if (mensagens.length > 1) {
      setMensagens(mensagens.filter((m) => m.id !== id));
    }
  };

  const updateMensagem = (id: number, texto: string) => {
    setMensagens(mensagens.map((m) => (m.id === id ? { ...m, texto } : m)));
  };

  const handleEnviar = () => {
    if (!nomeCampanha.trim()) {
      toast({ title: "Nome obrigatório", description: "Defina um nome para a campanha.", variant: "destructive" });
      return;
    }
    if (mensagens.every((m) => !m.texto.trim())) {
      toast({ title: "Mensagem obrigatória", description: "Adicione pelo menos uma mensagem.", variant: "destructive" });
      return;
    }
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      toast({ title: "Campanha criada!", description: `"${nomeCampanha}" agendada com sucesso.` });
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Novo <span className="text-primary glow-text">Disparo</span>
          </h1>
          <p className="text-muted-foreground mt-1">Configure sua campanha de mensagens</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nome da Campanha</label>
            <Input
              placeholder="Ex: Promoção de Verão"
              value={nomeCampanha}
              onChange={(e) => setNomeCampanha(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>

          {/* Mensagens */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Mensagens ({mensagens.length})
              </label>
              <Button onClick={addMensagem} variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                <Plus className="w-4 h-4 mr-1" /> Adicionar variação
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Adicione variações para simular comportamento humano. Uma será escolhida aleatoriamente para cada envio.
            </p>
            {mensagens.map((msg, i) => (
              <div key={msg.id} className="relative">
                <Textarea
                  placeholder={`Mensagem ${i + 1}...`}
                  value={msg.texto}
                  onChange={(e) => updateMensagem(msg.id, e.target.value)}
                  className="bg-secondary border-border min-h-[100px] pr-10"
                />
                {mensagens.length > 1 && (
                  <button
                    onClick={() => removeMensagem(msg.id)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Delay */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Delay entre mensagens (segundos)
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="Mín"
                value={delayMin}
                onChange={(e) => setDelayMin(e.target.value)}
                className="bg-secondary border-border w-24"
              />
              <span className="text-muted-foreground">a</span>
              <Input
                type="number"
                placeholder="Máx"
                value={delayMax}
                onChange={(e) => setDelayMax(e.target.value)}
                className="bg-secondary border-border w-24"
              />
              <span className="text-xs text-muted-foreground">segundos</span>
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleEnviar}
            disabled={enviando}
            className="w-full gradient-primary text-primary-foreground hover:opacity-90 font-semibold h-12"
          >
            {enviando ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Iniciar Disparo
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
}
