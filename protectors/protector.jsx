// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/config";
import { toast } from "sonner";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [toastId, setToastId] = useState(null);

  useEffect(() => {
    const id = toast.loading("Checking authentication...");
    setToastId(id);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthenticated(!!user);
      setLoading(false);
      toast.dismiss(id);
    });

    return () => {
      unsubscribe();
      toast.dismiss(id); // Ensure toast is gone if unmounted early
    };
  }, []);

  if (loading) return null; // Nothing renders while loading

  return authenticated ? children : <Navigate to="/admin-login" replace />;
};

export default ProtectedRoute;
