
CREATE TABLE public.respostas_automaticas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instancia_id UUID REFERENCES public.instancias(id) ON DELETE SET NULL,
  palavra_chave TEXT NOT NULL,
  resposta TEXT NOT NULL,
  delay_segundos INTEGER NOT NULL DEFAULT 3,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.respostas_automaticas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own auto replies" ON public.respostas_automaticas FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_respostas_automaticas_updated_at BEFORE UPDATE ON public.respostas_automaticas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.grupos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  link TEXT,
  membros INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'cheio', 'invalido')),
  instancia_id UUID REFERENCES public.instancias(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own groups" ON public.grupos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_grupos_updated_at BEFORE UPDATE ON public.grupos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.aquecimento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instancia_id UUID NOT NULL REFERENCES public.instancias(id) ON DELETE CASCADE,
  mensagens_por_dia INTEGER NOT NULL DEFAULT 20,
  delay_min INTEGER NOT NULL DEFAULT 30,
  delay_max INTEGER NOT NULL DEFAULT 120,
  dia_atual INTEGER NOT NULL DEFAULT 0,
  dias_total INTEGER NOT NULL DEFAULT 14,
  ativo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.aquecimento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own warmup" ON public.aquecimento FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_aquecimento_updated_at BEFORE UPDATE ON public.aquecimento FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  telefone TEXT,
  email TEXT,
  origem TEXT DEFAULT 'manual',
  pontuacao INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'qualificado', 'convertido', 'descartado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own leads" ON public.leads FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
