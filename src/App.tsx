import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ClienteDashboard from "./pages/cliente/ClienteDashboard";
import Disparos from "./pages/cliente/Disparos";
import ImportarContatos from "./pages/cliente/ImportarContatos";
import Contatos from "./pages/cliente/Contatos";
import Mensagens from "./pages/cliente/Mensagens";
import Filtros from "./pages/cliente/Filtros";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, tipo }: { children: React.ReactNode; tipo?: "admin" | "cliente" }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (tipo && user?.tipo !== tipo) return <Navigate to={user?.tipo === "admin" ? "/admin" : "/cliente"} replace />;
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

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute tipo="admin"><AdminDashboard /></ProtectedRoute>} />

            {/* Cliente */}
            <Route path="/cliente" element={<ProtectedRoute tipo="cliente"><ClienteDashboard /></ProtectedRoute>} />
            <Route path="/cliente/disparos" element={<ProtectedRoute tipo="cliente"><Disparos /></ProtectedRoute>} />
            <Route path="/cliente/importar" element={<ProtectedRoute tipo="cliente"><ImportarContatos /></ProtectedRoute>} />
            <Route path="/cliente/contatos" element={<ProtectedRoute tipo="cliente"><Contatos /></ProtectedRoute>} />
            <Route path="/cliente/mensagens" element={<ProtectedRoute tipo="cliente"><Mensagens /></ProtectedRoute>} />
            <Route path="/cliente/filtros" element={<ProtectedRoute tipo="cliente"><Filtros /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
