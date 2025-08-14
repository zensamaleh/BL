import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Download, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  FileText,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Users
} from "lucide-react";
import { User } from "../App";

interface ChefInterfaceProps {
  user: User;
  onNavigate: (page: string) => void;
}

interface BLStats {
  total: number;
  validated: number;
  pending: number;
  rejected: number;
  montantTotal: number;
  palettesTotal: number;
  ecarts: number;
  palettesStockees: number;
}

interface MonthlyReport {
  numeroBL: string;
  montant: number;
  datePreparation: Date;
  dateReception: Date;
  dateSaisie: Date;
  status: string;
  chauffeur: string;
  agent: string;
}

export function ChefInterface({ user, onNavigate }: ChefInterfaceProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [reportFormat, setReportFormat] = useState("pdf");

  // Données simulées
  const stats: BLStats = {
    total: 245,
    validated: 220,
    pending: 15,
    rejected: 10,
    montantTotal: 6850000,
    palettesTotal: 1240,
    ecarts: 8,
    palettesStockees: 25
  };

  const monthlyData: MonthlyReport[] = [
    {
      numeroBL: "BL2024001",
      montant: 25000,
      datePreparation: new Date("2024-08-01"),
      dateReception: new Date("2024-08-01"),
      dateSaisie: new Date("2024-08-01"),
      status: "Validé",
      chauffeur: "Ahmed Benkiran",
      agent: "Sara Alami"
    },
    {
      numeroBL: "BL2024002",
      montant: 18000,
      datePreparation: new Date("2024-08-02"),
      dateReception: new Date("2024-08-02"),
      dateSaisie: new Date("2024-08-02"),
      status: "Validé",
      chauffeur: "Mohamed Alami",
      agent: "Sara Alami"
    },
    {
      numeroBL: "BL2024003",
      montant: 32000,
      datePreparation: new Date("2024-08-03"),
      dateReception: new Date("2024-08-03"),
      dateSaisie: new Date("2024-08-03"),
      status: "Validé",
      chauffeur: "Youssef Radi",
      agent: "Hassan Benali"
    }
  ];

  const generateReport = () => {
    const reportData = {
      period: selectedPeriod,
      format: reportFormat,
      timestamp: new Date().toISOString(),
      data: monthlyData,
      stats: stats
    };
    
    // Simulation de génération de rapport
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-bl-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.${reportFormat === 'excel' ? 'xlsx' : 'pdf'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const calculateTrend = (current: number, previous: number) => {
    const trend = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(trend).toFixed(1),
      isPositive: trend > 0,
      icon: trend > 0 ? TrendingUp : TrendingDown
    };
  };

  // Données de tendance simulées
  const validationRate = 89.8;
  const validationTrend = calculateTrend(validationRate, 85.2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-900)] via-black to-[var(--color-800)] text-[var(--color-100)]">
      {/* Header */}
      <header className="border-b border-[var(--color-700)] bg-[var(--color-800)]/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => onNavigate("dashboard")}
                className="text-[var(--color-200)] hover:text-[var(--color-100)] hover:bg-[var(--color-700)]"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-[var(--color-100)]">Interface Chef/Manager</h1>
                <p className="text-sm text-[var(--color-300)]">Rapports et analytics des BL</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-600 text-white">
                <Users className="h-3 w-3 mr-1" />
                Manager
              </Badge>
              <div className="text-right">
                <p className="font-medium text-[var(--color-100)]">{user.name}</p>
                <p className="text-sm text-[var(--color-300)]">Chef/Manager</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-none text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total BL ce mois</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">+12% vs mois dernier</span>
                  </div>
                </div>
                <FileText className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-none text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Taux de validation</p>
                  <p className="text-3xl font-bold">{validationRate}%</p>
                  <div className="flex items-center mt-2">
                    {React.createElement(validationTrend.icon, { className: "h-4 w-4 mr-1" })}
                    <span className="text-sm">
                      {validationTrend.isPositive ? '+' : '-'}{validationTrend.value}%
                    </span>
                  </div>
                </div>
                <CheckCircle className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-none text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">En attente</p>
                  <p className="text-3xl font-bold">{stats.pending}</p>
                  <div className="flex items-center mt-2">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">Délai moyen: 2h</span>
                  </div>
                </div>
                <Clock className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-none text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Montant total</p>
                  <p className="text-2xl font-bold">{(stats.montantTotal / 1000000).toFixed(1)}M DH</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">+8% vs mois dernier</span>
                  </div>
                </div>
                <BarChart3 className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analytics */}
          <div className="lg:col-span-2">
            <Card className="bg-[var(--color-800)]/50 border-[var(--color-700)]">
              <CardHeader>
                <CardTitle className="text-[var(--color-100)] flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Analytics & Rapports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-[var(--color-700)]/50">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-[var(--color-600)]">
                      Vue d'ensemble
                    </TabsTrigger>
                    <TabsTrigger value="trends" className="data-[state=active]:bg-[var(--color-600)]">
                      Tendances
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="data-[state=active]:bg-[var(--color-600)]">
                      Performance
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[var(--color-700)]/30 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[var(--color-300)] text-sm">BL Validés</span>
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        </div>
                        <p className="text-2xl font-bold text-[var(--color-100)]">{stats.validated}</p>
                        <p className="text-xs text-[var(--color-400)]">90% du total</p>
                      </div>
                      
                      <div className="bg-[var(--color-700)]/30 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[var(--color-300)] text-sm">Écarts Détectés</span>
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                        </div>
                        <p className="text-2xl font-bold text-[var(--color-100)]">{stats.ecarts}</p>
                        <p className="text-xs text-[var(--color-400)]">3.3% du total</p>
                      </div>
                    </div>

                    <div className="bg-[var(--color-700)]/30 p-4 rounded-lg">
                      <h4 className="text-[var(--color-100)] font-medium mb-3">Répartition par statut</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--color-300)]">Validés</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 h-2 bg-[var(--color-600)] rounded">
                              <div className="w-4/5 h-2 bg-green-500 rounded"></div>
                            </div>
                            <span className="text-[var(--color-100)] text-sm">{stats.validated}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--color-300)]">En attente</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 h-2 bg-[var(--color-600)] rounded">
                              <div className="w-1/6 h-2 bg-orange-500 rounded"></div>
                            </div>
                            <span className="text-[var(--color-100)] text-sm">{stats.pending}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--color-300)]">Rejetés</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 h-2 bg-[var(--color-600)] rounded">
                              <div className="w-1/12 h-2 bg-red-500 rounded"></div>
                            </div>
                            <span className="text-[var(--color-100)] text-sm">{stats.rejected}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="trends" className="space-y-4">
                    <div className="bg-[var(--color-700)]/30 p-4 rounded-lg">
                      <h4 className="text-[var(--color-100)] font-medium mb-3 flex items-center">
                        <LineChart className="h-4 w-4 mr-2" />
                        Évolution mensuelle
                      </h4>
                      <div className="text-center py-8">
                        <LineChart className="h-16 w-16 text-[var(--color-400)] mx-auto mb-4" />
                        <p className="text-[var(--color-300)]">Graphique d'évolution des BL</p>
                        <p className="text-sm text-[var(--color-400)]">Tendance positive +15% ce mois</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="performance" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[var(--color-700)]/30 p-4 rounded-lg">
                        <h4 className="text-[var(--color-100)] font-medium mb-2">Performance Chauffeurs</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-[var(--color-300)]">Ahmed B.</span>
                            <span className="text-green-400">98%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--color-300)]">Mohamed A.</span>
                            <span className="text-green-400">95%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--color-300)]">Youssef R.</span>
                            <span className="text-yellow-400">88%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[var(--color-700)]/30 p-4 rounded-lg">
                        <h4 className="text-[var(--color-100)] font-medium mb-2">Performance Agents</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-[var(--color-300)]">Sara A.</span>
                            <span className="text-green-400">96%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--color-300)]">Hassan B.</span>
                            <span className="text-green-400">94%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Report Generation */}
          <div className="space-y-6">
            {/* Report Generator */}
            <Card className="bg-[var(--color-800)]/50 border-[var(--color-700)]">
              <CardHeader>
                <CardTitle className="text-[var(--color-100)] flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Générer Rapport
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[var(--color-200)] text-sm">Période</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="bg-[var(--color-700)]/50 border-[var(--color-600)] text-[var(--color-100)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--color-800)] border-[var(--color-700)]">
                      <SelectItem value="week" className="text-[var(--color-100)]">Cette semaine</SelectItem>
                      <SelectItem value="month" className="text-[var(--color-100)]">Ce mois</SelectItem>
                      <SelectItem value="quarter" className="text-[var(--color-100)]">Ce trimestre</SelectItem>
                      <SelectItem value="custom" className="text-[var(--color-100)]">Période personnalisée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[var(--color-200)] text-sm">Format</label>
                  <Select value={reportFormat} onValueChange={setReportFormat}>
                    <SelectTrigger className="bg-[var(--color-700)]/50 border-[var(--color-600)] text-[var(--color-100)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--color-800)] border-[var(--color-700)]">
                      <SelectItem value="pdf" className="text-[var(--color-100)]">PDF</SelectItem>
                      <SelectItem value="excel" className="text-[var(--color-100)]">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generateReport}
                  className="w-full bg-gradient-to-r from-[var(--color-700)] to-[var(--color-600)] hover:from-[var(--color-600)] hover:to-[var(--color-500)] text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger Rapport
                </Button>

                <div className="bg-blue-900/20 border border-blue-700/50 rounded p-3">
                  <p className="text-blue-200 text-sm">
                    Le rapport inclura les 5 colonnes requises : N° BL, Montant, Date préparation, Date réception, Date saisie
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stock Status */}
            <Card className="bg-[var(--color-800)]/50 border-[var(--color-700)]">
              <CardHeader>
                <CardTitle className="text-[var(--color-100)] flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Stock Fournisseur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-300)]">Palettes en attente</span>
                    <Badge className="bg-orange-600 text-white">{stats.palettesStockees}</Badge>
                  </div>
                  
                  <div className="bg-[var(--color-700)]/30 p-3 rounded">
                    <p className="text-[var(--color-200)] font-medium mb-2">À récupérer cette semaine:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-400)]">Produits A:</span>
                        <span className="text-[var(--color-100)]">8 palettes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-400)]">Produits B:</span>
                        <span className="text-[var(--color-100)]">12 palettes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-400)]">Produits C:</span>
                        <span className="text-[var(--color-100)]">5 palettes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="bg-red-900/20 border-red-700/50">
              <CardHeader>
                <CardTitle className="text-red-200 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Alertes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-red-200 text-sm font-medium">Écart détecté</p>
                      <p className="text-red-300 text-xs">BL2024045 - Différence de 2000 DH</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 text-orange-400 mt-0.5" />
                    <div>
                      <p className="text-orange-200 text-sm font-medium">Délai dépassé</p>
                      <p className="text-orange-300 text-xs">3 BL en attente depuis +4h</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}