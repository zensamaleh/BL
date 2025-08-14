import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  Eye,
  Edit,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  FileText,
  Database
} from "lucide-react";
import { User } from "../App";

interface BL {
  id: string;
  numero: string;
  montant: number;
  palettes: number;
  status: "captured" | "pending" | "validated" | "rejected";
  timestamp: Date;
  chauffeur: string;
  images: string[];
  notes?: string;
  agentNotes?: string;
  validatedAt?: Date;
  ecarts?: {
    type: string;
    description: string;
    montant?: number;
  }[];
}

interface AgentInterfaceProps {
  user: User;
  onNavigate: (page: string) => void;
}

export function AgentInterface({ user, onNavigate }: AgentInterfaceProps) {
  const [selectedBL, setSelectedBL] = useState<BL | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingBLs, setPendingBLs] = useState<BL[]>([
    {
      id: "1",
      numero: "BL2024001",
      montant: 25000,
      palettes: 4,
      status: "captured",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      chauffeur: "Ahmed Benkiran",
      images: ["img1.jpg"],
      notes: "Toutes les palettes en bon état"
    },
    {
      id: "2",
      numero: "BL2024002", 
      montant: 18000,
      palettes: 2,
      status: "captured",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      chauffeur: "Mohamed Alami",
      images: ["img2.jpg"]
    },
    {
      id: "3",
      numero: "BL2024003",
      montant: 32000,
      palettes: 6,
      status: "captured",
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      chauffeur: "Youssef Radi",
      images: ["img3.jpg"],
      notes: "1 palette légèrement endommagée"
    }
  ]);

  const [validatedBLs, setValidatedBLs] = useState<BL[]>([
    {
      id: "4",
      numero: "BL2024000",
      montant: 15000,
      palettes: 3,
      status: "validated",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      chauffeur: "Hassan Benali",
      images: ["img4.jpg"],
      validatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      agentNotes: "Validation conforme, intégration système effectuée"
    }
  ]);

  const handleValidateBL = (bl: BL, notes: string) => {
    const updatedBL = {
      ...bl,
      status: "validated" as const,
      validatedAt: new Date(),
      agentNotes: notes
    };
    
    setPendingBLs(pendingBLs.filter(b => b.id !== bl.id));
    setValidatedBLs([updatedBL, ...validatedBLs]);
    setSelectedBL(null);
  };

  const handleRejectBL = (bl: BL, reason: string) => {
    const updatedBL = {
      ...bl,
      status: "rejected" as const,
      agentNotes: reason
    };
    
    setPendingBLs(pendingBLs.map(b => b.id === bl.id ? updatedBL : b));
    setSelectedBL(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "captured": return "bg-orange-500";
      case "validated": return "bg-green-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "captured": return "En attente";
      case "validated": return "Validé";
      case "rejected": return "Rejeté";
      default: return "Inconnu";
    }
  };

  const filteredBLs = pendingBLs.filter(bl => 
    bl.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bl.chauffeur.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h1 className="text-xl font-semibold text-[var(--color-100)]">Interface Agent de Saisie</h1>
                <p className="text-sm text-[var(--color-300)]">Validation et traitement des BL</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-[var(--color-100)]">{user.name}</p>
              <p className="text-sm text-[var(--color-300)]">Agent de Saisie</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[var(--color-800)]/50 border-[var(--color-700)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-300)]">En Attente</p>
                  <p className="text-2xl font-bold text-orange-400">{pendingBLs.filter(bl => bl.status === "captured").length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[var(--color-800)]/50 border-[var(--color-700)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-300)]">Validés Aujourd'hui</p>
                  <p className="text-2xl font-bold text-green-400">{validatedBLs.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-800)]/50 border-[var(--color-700)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-300)]">Écarts Détectés</p>
                  <p className="text-2xl font-bold text-red-400">2</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-800)]/50 border-[var(--color-700)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-300)]">Système Intégré</p>
                  <p className="text-2xl font-bold text-blue-400">{validatedBLs.length}</p>
                </div>
                <Database className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* BL List */}
          <div className="lg:col-span-2">
            <Card className="bg-[var(--color-800)]/50 border-[var(--color-700)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[var(--color-100)]">Bons de Livraison</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--color-400)]" />
                      <Input
                        placeholder="Rechercher BL ou chauffeur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-[var(--color-700)]/50 border-[var(--color-600)] text-[var(--color-100)]"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="border-[var(--color-600)] text-[var(--color-200)]">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-[var(--color-700)]/50">
                    <TabsTrigger value="pending" className="data-[state=active]:bg-[var(--color-600)]">
                      En Attente ({pendingBLs.filter(bl => bl.status === "captured").length})
                    </TabsTrigger>
                    <TabsTrigger value="processed" className="data-[state=active]:bg-[var(--color-600)]">
                      Traités ({validatedBLs.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="pending" className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredBLs.map((bl) => (
                      <div 
                        key={bl.id} 
                        className="border border-[var(--color-700)] rounded-lg p-4 bg-[var(--color-700)]/30 cursor-pointer hover:bg-[var(--color-700)]/50 transition-colors"
                        onClick={() => setSelectedBL(bl)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-[var(--color-300)]" />
                            <div>
                              <p className="font-medium text-[var(--color-100)]">{bl.numero}</p>
                              <p className="text-sm text-[var(--color-400)]">
                                {bl.chauffeur} • {bl.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${getStatusColor(bl.status)} text-white`}>
                              {getStatusText(bl.status)}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-[var(--color-400)]">Montant: </span>
                            <span className="text-[var(--color-100)] font-medium">{bl.montant.toLocaleString()} DH</span>
                          </div>
                          <div>
                            <span className="text-[var(--color-400)]">Palettes: </span>
                            <span className="text-[var(--color-100)] font-medium">{bl.palettes}</span>
                          </div>
                        </div>
                        
                        {bl.notes && (
                          <div className="mt-3 p-2 bg-[var(--color-600)]/30 rounded text-sm">
                            <span className="text-[var(--color-400)]">Notes chauffeur: </span>
                            <span className="text-[var(--color-200)]">{bl.notes}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="processed" className="space-y-4 max-h-96 overflow-y-auto">
                    {validatedBLs.map((bl) => (
                      <div key={bl.id} className="border border-[var(--color-700)] rounded-lg p-4 bg-[var(--color-700)]/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <div>
                              <p className="font-medium text-[var(--color-100)]">{bl.numero}</p>
                              <p className="text-sm text-[var(--color-400)]">
                                Validé le {bl.validatedAt?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-500 text-white">Validé</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-[var(--color-400)]">Montant: </span>
                            <span className="text-[var(--color-100)] font-medium">{bl.montant.toLocaleString()} DH</span>
                          </div>
                          <div>
                            <span className="text-[var(--color-400)]">Palettes: </span>
                            <span className="text-[var(--color-100)] font-medium">{bl.palettes}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Validation Panel */}
          <div>
            {selectedBL ? (
              <Card className="bg-[var(--color-800)]/50 border-[var(--color-700)]">
                <CardHeader>
                  <CardTitle className="text-[var(--color-100)] flex items-center">
                    <Edit className="h-5 w-5 mr-2" />
                    Validation BL
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border border-[var(--color-600)] rounded-lg p-4 bg-[var(--color-700)]/30">
                    <h3 className="font-medium text-[var(--color-100)] mb-2">{selectedBL.numero}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-400)]">Chauffeur:</span>
                        <span className="text-[var(--color-200)]">{selectedBL.chauffeur}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-400)]">Montant:</span>
                        <span className="text-[var(--color-200)]">{selectedBL.montant.toLocaleString()} DH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-400)]">Palettes:</span>
                        <span className="text-[var(--color-200)]">{selectedBL.palettes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-400)]">Heure:</span>
                        <span className="text-[var(--color-200)]">{selectedBL.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {selectedBL.notes && (
                      <div className="mt-3 p-2 bg-[var(--color-600)]/30 rounded">
                        <p className="text-xs text-[var(--color-400)] mb-1">Notes du chauffeur:</p>
                        <p className="text-sm text-[var(--color-200)]">{selectedBL.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[var(--color-200)]">Notes de validation</Label>
                    <Textarea
                      placeholder="Commentaires sur la validation, écarts détectés, etc."
                      className="bg-[var(--color-700)]/50 border-[var(--color-600)] text-[var(--color-100)]"
                    />
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={() => handleValidateBL(selectedBL, "Validation conforme, intégration système effectuée")}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Valider et Intégrer au Système
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => handleRejectBL(selectedBL, "Écart détecté - à revoir")}
                      className="w-full border-red-600 text-red-400 hover:bg-red-600/10"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter pour Correction
                    </Button>
                    
                    <Button 
                      variant="ghost"
                      onClick={() => setSelectedBL(null)}
                      className="w-full text-[var(--color-300)] hover:bg-[var(--color-700)]"
                    >
                      Annuler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[var(--color-800)]/50 border-[var(--color-700)]">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-[var(--color-400)] mx-auto mb-4" />
                  <p className="text-[var(--color-300)]">
                    Sélectionnez un BL à valider
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}