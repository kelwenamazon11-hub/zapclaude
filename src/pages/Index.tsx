import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.tipo === "admin" ? "/admin" : "/cliente");
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  return null;
}
