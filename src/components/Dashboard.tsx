import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Truck, 
  ClipboardCheck, 
  BarChart3, 
  User, 
  LogOut,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { User as UserType } from "../App";

interface DashboardProps {
  user: UserType;
  onNavigate: (page: string) => void;
}

export function Dashboard({ user, onNavigate }: DashboardProps) {
  const getRoleSpecificCards = () => {
    switch (user.role) {
      case "chauffeur":
        return [
          {
            title: "Capturer BL",
            description: "Scanner et valider les bons de livraison",
            icon: <Truck className="h-8 w-8" />,
            action: () => onNavigate("chauffeur"),
            color: "bg-gradient-to-br from-[var(--color-700)] to-[var(--color-800)]"
          }
        ];
      case "agent":
        return [
          {
            title: "Validation BL",
            description: "Valider et saisir les bons en attente",
            icon: <ClipboardCheck className="h-8 w-8" />,
            action: () => onNavigate("agent"),
            color: "bg-gradient-to-br from-[var(--color-600)] to-[var(--color-700)]"
          }
        ];
      case "chef":
        return [
          {
            title: "Rapports & Analytics",
            description: "Consulter les rapports et statistiques",
            icon: <BarChart3 className="h-8 w-8" />,
            action: () => onNavigate("chef"),
            color: "bg-gradient-to-br from-[var(--color-500)] to-[var(--color-600)]"
          }
        ];
      default:
        return [];
    }
  };

  const stats = [
    { label: "BL En attente", value: "12", icon: <Clock className="h-5 w-5" />, color: "text-orange-400" },
    { label: "BL Validés", value: "156", icon: <CheckCircle className="h-5 w-5" />, color: "text-green-400" },
    { label: "Écarts détectés", value: "3", icon: <AlertTriangle className="h-5 w-5" />, color: "text-red-400" },
    { label: "Palettes stockées", value: "8", icon: <Package className="h-5 w-5" />, color: "text-blue-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-900)] via-black to-[var(--color-800)] text-[var(--color-100)]">
      {/* Header */}
      <header className="border-b border-[var(--color-700)] bg-[var(--color-800)]/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[var(--color-600)] to-[var(--color-700)] flex items-center justify-center">
                <User className="h-5 w-5 text-[var(--color-100)]" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[var(--color-100)]">Aegean BL</h1>
                <p className="text-sm text-[var(--color-300)]">Gestion des Bons de Livraison</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium text-[var(--color-100)]">{user.name}</p>
                <p className="text-sm text-[var(--color-300)] capitalize">{user.role}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="border-[var(--color-600)] text-[var(--color-200)] hover:bg-[var(--color-700)]"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-light text-[var(--color-100)] mb-2">
            Bonjour, <span className="font-medium">{user.name}</span>
          </h2>
          <p className="text-[var(--color-300)]">
            Voici votre tableau de bord pour la gestion des bons de livraison.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-[var(--color-800)]/50 border-[var(--color-700)] backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--color-300)]">{stat.label}</p>
                    <p className="text-2xl font-bold text-[var(--color-100)]">{stat.value}</p>
                  </div>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getRoleSpecificCards().map((card, index) => (
            <Card 
              key={index} 
              className={`${card.color} border-none cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
              onClick={card.action}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-white/10 rounded-full w-fit">
                  {React.cloneElement(card.icon, { className: "h-8 w-8 text-white" })}
                </div>
                <CardTitle className="text-white text-xl">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-white/80">{card.description}</p>
              </CardContent>
            </Card>
          ))}

          {/* Common cards available to all roles */}
          <Card className="bg-[var(--color-800)]/30 border-[var(--color-700)] cursor-pointer transform transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-[var(--color-700)]/50 rounded-full w-fit">
                <BarChart3 className="h-8 w-8 text-[var(--color-200)]" />
              </div>
              <CardTitle className="text-[var(--color-100)] text-xl">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-[var(--color-300)]">Consulter les statistiques générales</p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-800)]/30 border-[var(--color-700)] cursor-pointer transform transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-[var(--color-700)]/50 rounded-full w-fit">
                <Package className="h-8 w-8 text-[var(--color-200)]" />
              </div>
              <CardTitle className="text-[var(--color-100)] text-xl">Stock Fournisseur</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-[var(--color-300)]">Palettes en attente de récupération</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card className="bg-[var(--color-800)]/50 border-[var(--color-700)]">
            <CardHeader>
              <CardTitle className="text-[var(--color-100)]">Activité Récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-[var(--color-700)]/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div className="flex-1">
                    <p className="text-[var(--color-100)] text-sm">BL #12345 validé par Agent Saisie</p>
                    <p className="text-[var(--color-400)] text-xs">Il y a 2 heures</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-[var(--color-700)]/30 rounded-lg">
                  <Truck className="h-5 w-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-[var(--color-100)] text-sm">Nouvelle livraison capturée - 5 palettes</p>
                    <p className="text-[var(--color-400)] text-xs">Il y a 4 heures</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-[var(--color-700)]/30 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  <div className="flex-1">
                    <p className="text-[var(--color-100)] text-sm">Écart détecté sur BL #12340</p>
                    <p className="text-[var(--color-400)] text-xs">Il y a 6 heures</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}