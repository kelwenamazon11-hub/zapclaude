import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, FileSpreadsheet, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ImportTab = "texto" | "arquivo";

function parseNumeros(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((n) => n.replace(/\D/g, "").trim())
    .filter((n) => n.length >= 10 && n.length <= 15);
}

export default function ImportarContatos() {
  const [activeTab, setActiveTab] = useState<ImportTab>("texto");
  const [textoNumeros, setTextoNumeros] = useState("");
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [resultado, setResultado] = useState<{ validos: number; invalidos: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const importarMutation = useMutation({
    mutationFn: async (numeros: string[]) => {
      const unique = [...new Set(numeros)];
      const rows = unique.map((n) => ({ user_id: user!.id, numero: n, tag: "lead" }));
      const { error } = await supabase.from("contatos").insert(rows);
      if (error) throw error;
      return { validos: unique.length, invalidos: numeros.length - unique.length };
    },
    onSuccess: (result) => {
      setResultado(result);
      queryClient.invalidateQueries({ queryKey: ["contatos"] });
      queryClient.invalidateQueries({ queryKey: ["contatos-count"] });
      toast({ title: "Importação concluída!", description: `${result.validos} contatos importados.` });
    },
    onError: () => toast({ title: "Erro na importação", variant: "destructive" }),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowed = files.filter((f) => [".txt", ".csv", ".xlsx", ".xls", ".pdf"].some((ext) => f.name.toLowerCase().endsWith(ext)));
    setArquivos((prev) => [...prev, ...allowed]);
  };

  const removeFile = (index: number) => setArquivos(arquivos.filter((_, i) => i !== index));

  const getFileIcon = (name: string) => {
    if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) return FileSpreadsheet;
    if (name.endsWith(".pdf")) return File;
    return FileText;
  };

  const handleImportar = async () => {
    if (activeTab === "texto") {
      const numeros = parseNumeros(textoNumeros);
      if (numeros.length === 0) {
        toast({ title: "Nenhum número válido", variant: "destructive" });
        return;
      }
      importarMutation.mutate(numeros);
    } else {
      // For file import, read text files
      const allNumeros: string[] = [];
      for (const file of arquivos) {
        if (file.name.endsWith(".txt") || file.name.endsWith(".csv")) {
          const text = await file.text();
          allNumeros.push(...parseNumeros(text));
        }
      }
      if (allNumeros.length === 0) {
        toast({ title: "Nenhum número encontrado nos arquivos", description: "Para Excel/PDF, use o formato texto por enquanto.", variant: "destructive" });
        return;
      }
      importarMutation.mutate(allNumeros);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Importar <span className="text-primary glow-text">Contatos</span>
          </h1>
          <p className="text-muted-foreground mt-1">Adicione números via texto ou arquivo</p>
        </motion.div>

        <div className="flex gap-2">
          {(["texto", "arquivo"] as ImportTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab ? "bg-primary/10 text-primary border border-primary/30" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "texto" ? "Colar Texto" : "Upload de Arquivo"}
            </button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-6">
          {activeTab === "texto" ? (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Cole os números (um por linha ou separados por vírgula)</label>
              <Textarea placeholder={"5511999990001\n5511999990002"} value={textoNumeros} onChange={(e) => setTextoNumeros(e.target.value)} className="bg-secondary border-border min-h-[200px] font-mono text-sm" />
              <p className="text-xs text-muted-foreground">{parseNumeros(textoNumeros).length} números válidos detectados</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-foreground font-medium">Clique ou arraste arquivos</p>
                <p className="text-xs text-muted-foreground mt-1">TXT, CSV</p>
              </div>
              <input ref={fileRef} type="file" multiple accept=".txt,.csv" className="hidden" onChange={handleFileChange} />
              {arquivos.length > 0 && (
                <div className="space-y-2">
                  {arquivos.map((file, i) => {
                    const Icon = getFileIcon(file.name);
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                        <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {resultado && (
            <div className="flex gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center gap-2 text-green-400"><CheckCircle className="w-4 h-4" /><span className="text-sm font-medium">{resultado.validos} importados</span></div>
              <div className="flex items-center gap-2 text-red-400"><AlertCircle className="w-4 h-4" /><span className="text-sm font-medium">{resultado.invalidos} duplicados</span></div>
            </div>
          )}

          <Button
            onClick={handleImportar}
            disabled={importarMutation.isPending || (activeTab === "texto" ? !textoNumeros.trim() : arquivos.length === 0)}
            className="w-full gradient-primary text-primary-foreground hover:opacity-90 font-semibold h-12"
          >
            {importarMutation.isPending ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : "Importar Contatos"}
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
}
