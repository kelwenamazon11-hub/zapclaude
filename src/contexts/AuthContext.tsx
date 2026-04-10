import { createContext, useContext, useState, ReactNode } from "react";

export type UserType = "admin" | "cliente";

interface User {
  id: string;
  nome: string;
  email: string;
  tipo: UserType;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, senha: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demo
const MOCK_USERS: (User & { senha: string })[] = [
  { id: "1", nome: "Administrador", email: "admin@zapclaude.com", tipo: "admin", senha: "admin123" },
  { id: "2", nome: "Cliente Demo", email: "cliente@zapclaude.com", tipo: "cliente", senha: "cliente123" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("zapclaude_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, senha: string): boolean => {
    const found = MOCK_USERS.find((u) => u.email === email && u.senha === senha);
    if (found) {
      const { senha: _, ...userData } = found;
      setUser(userData);
      localStorage.setItem("zapclaude_user", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("zapclaude_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
