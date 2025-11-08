import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../shared/contexts/AuthContext";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import Login from "../features/auth/Login";

const Dashboard: React.FC = () => {
  return (
    <div className="p-6 text-slate-100">
      <h2 className="text-2xl font-semibold">Panel privado</h2>
      <p className="mt-2 text-slate-300">
        Estás autenticado y puedes ver contenido protegido.
      </p>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
