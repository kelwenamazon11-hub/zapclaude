import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, CheckCircle, XCircle, Phone } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function Filtros() {
  const [removerInvalidos, setRemoverInvalidos] = useState(true);
  const [removerDuplicados, setRemoverDuplicados] = useState(true);
  const [apenasWhatsapp, setApenasWhatsapp] = useState(false);
  const [filtrando, setFiltrando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [resultado, setResultado] = useState<{
    total: number;
    validos: number;
    invalidos: number;
    duplicados: number;
  } | null>(null);
  const { toast } = useToast();

  const handleFiltrar = () => {
    setFiltrando(true);
    setProgresso(0);
    setResultado(null);

    const interval = setInterval(() => {
      setProgresso((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setFiltrando(false);
          setResultado({ total: 2156, validos: 1890, invalidos: 178, duplicados: 88 });
          toast({ title: "Filtragem concluída!", description: "1.890 contatos válidos na sua lista." });
          return 100;
        }
        return p + 5;
      });
    }, 100);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Filtrar <span className="text-primary glow-text">Contatos</span>
          </h1>
          <p className="text-muted-foreground mt-1">Limpe e valide sua lista de números</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-6">
          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Remover números inválidos</p>
                <p className="text-xs text-muted-foreground">Valida formato e DDD</p>
              </div>
              <Switch checked={removerInvalidos} onCheckedChange={setRemoverInvalidos} />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Remover duplicados</p>
                <p className="text-xs text-muted-foreground">Mantém apenas uma ocorrência</p>
              </div>
              <Switch checked={removerDuplicados} onCheckedChange={setRemoverDuplicados} />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Apenas WhatsApp</p>
                <p className="text-xs text-muted-foreground">Verifica se o número tem WhatsApp ativo</p>
              </div>
              <Switch checked={apenasWhatsapp} onCheckedChange={setApenasWhatsapp} />
            </div>
          </div>

          {/* Progress */}
          {filtrando && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Filtrando...</span>
                <span className="text-primary font-medium">{progresso}%</span>
              </div>
              <Progress value={progresso} className="h-2" />
            </div>
          )}

          {/* Results */}
          {resultado && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 text-center">
                <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-2xl font-display font-bold text-green-400">{resultado.validos}</p>
                <p className="text-xs text-muted-foreground">Válidos</p>
              </div>
              <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-center">
                <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <p className="text-2xl font-display font-bold text-red-400">{resultado.invalidos}</p>
                <p className="text-xs text-muted-foreground">Inválidos</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleFiltrar}
            disabled={filtrando}
            className="w-full gradient-primary text-primary-foreground hover:opacity-90 font-semibold h-12"
          >
            {filtrando ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Filter className="w-4 h-4 mr-2" /> Iniciar Filtragem
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
}
