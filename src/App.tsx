import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { ChauffeurInterface } from "./components/ChauffeurInterface";
import { AgentInterface } from "./components/AgentInterface";
import { ChefInterface } from "./components/ChefInterface";
import { AuthProvider, useAuthState } from "./hooks/useAuth";

export type UserRole = "chauffeur" | "agent" | "chef" | "admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

function AppContent() {
  const { user, isLoading } = useAuthState();
  const [currentPage, setCurrentPage] = useState<string>("dashboard");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-900)] via-black to-[var(--color-800)] flex items-center justify-center">
        <div className="text-[var(--color-100)] text-lg">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "chauffeur":
        return <ChauffeurInterface user={user} onNavigate={setCurrentPage} />;
      case "agent":
        return <AgentInterface user={user} onNavigate={setCurrentPage} />;
      case "chef":
        return <ChefInterface user={user} onNavigate={setCurrentPage} />;
      default:
        return <Dashboard user={user} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-900)] via-black to-[var(--color-800)]">
      {renderCurrentPage()}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
