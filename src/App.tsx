import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Instancias from "./pages/admin/Instancias";
import Disparos from "./pages/admin/Disparos";
import ImportarContatos from "./pages/admin/ImportarContatos";
import Contatos from "./pages/admin/Contatos";
import Campanhas from "./pages/admin/Campanhas";
import Relatorios from "./pages/admin/Relatorios";
import Configuracoes from "./pages/admin/Configuracoes";
import Mensagens from "./pages/cliente/Mensagens";
import Filtros from "./pages/cliente/Filtros";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/instancias" element={<ProtectedRoute><Instancias /></ProtectedRoute>} />
            <Route path="/admin/disparos" element={<ProtectedRoute><Disparos /></ProtectedRoute>} />
            <Route path="/admin/importar" element={<ProtectedRoute><ImportarContatos /></ProtectedRoute>} />
            <Route path="/admin/contatos" element={<ProtectedRoute><Contatos /></ProtectedRoute>} />
            <Route path="/admin/campanhas" element={<ProtectedRoute><Campanhas /></ProtectedRoute>} />
            <Route path="/admin/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
            <Route path="/admin/config" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
            <Route path="/admin/mensagens" element={<ProtectedRoute><Mensagens /></ProtectedRoute>} />
            <Route path="/admin/filtros" element={<ProtectedRoute><Filtros /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
