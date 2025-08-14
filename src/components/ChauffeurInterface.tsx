import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  ArrowLeft, 
  Package, 
  CheckCircle, 
  Clock,
  MapPin,
  FileText,
  Upload,
  AlertCircle
} from "lucide-react";
import { User } from "../App";

interface BL {
  id: string;
  numero: string;
  montant: number;
  palettes: number;
  status: "captured" | "pending" | "validated";
  timestamp: Date;
  images: string[];
  notes?: string;
}

interface ChauffeurInterfaceProps {
  user: User;
  onNavigate: (page: string) => void;
}

export function ChauffeurInterface({ user, onNavigate }: ChauffeurInterfaceProps) {
  const [currentBL, setCurrentBL] = useState<Partial<BL>>({});
  const [capturedBLs, setCapturedBLs] = useState<BL[]>([
    {
      id: "1",
      numero: "BL2024001",
      montant: 25000,
      palettes: 4,
      status: "captured",
      timestamp: new Date(),
      images: ["img1.jpg"],
      notes: "Toutes les palettes en bon état"
    },
    {
      id: "2", 
      numero: "BL2024002",
      montant: 18000,
      palettes: 2,
      status: "validated",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      images: ["img2.jpg"]
    }
  ]);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCaptureBL = () => {
    if (currentBL.numero && currentBL.montant && currentBL.palettes) {
      const newBL: BL = {
        id: Date.now().toString(),
        numero: currentBL.numero,
        montant: currentBL.montant,
        palettes: currentBL.palettes,
        status: "captured",
        timestamp: new Date(),
        images: ["captured_image.jpg"],
        notes: currentBL.notes
      };
      
      setCapturedBLs([newBL, ...capturedBLs]);
      setCurrentBL({});
      setIsCapturing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "captured": return "bg-orange-500";
      case "validated": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "captured": return "Capturé";
      case "validated": return "Validé";
      default: return "En attente";
    }
  };

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
                <h1 className="text-xl font-semibold text-[var(--color-100)]">Interface Chauffeur</h1>
                <p className="text-sm text-[var(--color-300)]">Capture et validation des BL</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-600 text-white">
                <MapPin className="h-3 w-3 mr-1" />
                En mission
              </Badge>
              <div className="text-right">
                <p className="font-medium text-[var(--color-100)]">{user.name}</p>
                <p className="text-sm text-[var(--color-300)]">Chauffeur</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[var(--color-800)]/50 border-[var(--color-700)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-300)]">BL Capturés Aujourd'hui</p>
                  <p className="text-2xl font-bold text-[var(--color-100)]">{capturedBLs.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[var(--color-800)]/50 border-[var(--color-700)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-300)]">Palettes Livrées</p>
                  <p className="text-2xl font-bold text-[var(--color-100)]">
                    {capturedBLs.reduce((sum, bl) => sum + bl.palettes, 0)}
                  </p>
                </div>
                <Package className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-800)]/50 border-[var(--color-700)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-300)]">En Attente de Validation</p>
                  <p className="text-2xl font-bold text-[var(--color-100)]">
                    {capturedBLs.filter(bl => bl.status === "captured").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Capture BL Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Capture Form */}
          <Card className="bg-[var(--color-800)]/50 border-[var(--color-700)]">
            <CardHeader>
              <CardTitle className="text-[var(--color-100)] flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Capturer un Nouveau BL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isCapturing ? (
                <Button 
                  onClick={() => setIsCapturing(true)}
                  className="w-full bg-gradient-to-r from-[var(--color-700)] to-[var(--color-600)] hover:from-[var(--color-600)] hover:to-[var(--color-500)] text-white"
                  size="lg"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Commencer la Capture
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero" className="text-[var(--color-200)]">Numéro de BL</Label>
                    <Input
                      id="numero"
                      value={currentBL.numero || ""}
                      onChange={(e) => setCurrentBL({ ...currentBL, numero: e.target.value })}
                      placeholder="ex: BL2024003"
                      className="bg-[var(--color-700)]/50 border-[var(--color-600)] text-[var(--color-100)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="montant" className="text-[var(--color-200)]">Montant Total (DH)</Label>
                    <Input
                      id="montant"
                      type="number"
                      value={currentBL.montant || ""}
                      onChange={(e) => setCurrentBL({ ...currentBL, montant: Number(e.target.value) })}
                      placeholder="0"
                      className="bg-[var(--color-700)]/50 border-[var(--color-600)] text-[var(--color-100)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="palettes" className="text-[var(--color-200)]">Nombre de Palettes</Label>
                    <Input
                      id="palettes"
                      type="number"
                      value={currentBL.palettes || ""}
                      onChange={(e) => setCurrentBL({ ...currentBL, palettes: Number(e.target.value) })}
                      placeholder="0"
                      className="bg-[var(--color-700)]/50 border-[var(--color-600)] text-[var(--color-100)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-[var(--color-200)]">Notes (optionnel)</Label>
                    <Textarea
                      id="notes"
                      value={currentBL.notes || ""}
                      onChange={(e) => setCurrentBL({ ...currentBL, notes: e.target.value })}
                      placeholder="Commentaires sur l'état des palettes, écarts, etc."
                      className="bg-[var(--color-700)]/50 border-[var(--color-600)] text-[var(--color-100)]"
                    />
                  </div>

                  {/* Camera Simulation */}
                  <div className="border-2 border-dashed border-[var(--color-600)] rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-[var(--color-400)] mx-auto mb-4" />
                    <p className="text-[var(--color-300)] mb-2">Prendre une photo du BL</p>
                    <Button variant="outline" className="border-[var(--color-600)] text-[var(--color-200)]">
                      <Camera className="h-4 w-4 mr-2" />
                      Capturer Image
                    </Button>
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      onClick={handleCaptureBL}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Valider la Capture
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCapturing(false);
                        setCurrentBL({});
                      }}
                      className="border-[var(--color-600)] text-[var(--color-200)]"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Captures */}
          <Card className="bg-[var(--color-800)]/50 border-[var(--color-700)]">
            <CardHeader>
              <CardTitle className="text-[var(--color-100)]">BL Capturés Récemment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {capturedBLs.map((bl) => (
                  <div key={bl.id} className="border border-[var(--color-700)] rounded-lg p-4 bg-[var(--color-700)]/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-[var(--color-300)]" />
                        <div>
                          <p className="font-medium text-[var(--color-100)]">{bl.numero}</p>
                          <p className="text-sm text-[var(--color-400)]">
                            {bl.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(bl.status)} text-white`}>
                        {getStatusText(bl.status)}
                      </Badge>
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
                        <span className="text-[var(--color-400)]">Notes: </span>
                        <span className="text-[var(--color-200)]">{bl.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 bg-blue-900/20 border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-blue-200 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Instructions pour les Chauffeurs
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-100">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Vérifiez physiquement chaque palette avant de capturer le BL</li>
              <li>Prenez une photo claire du bon de livraison</li>
              <li>Saisissez avec précision le numéro, montant et nombre de palettes</li>
              <li>Notez tout écart ou problème dans les commentaires</li>
              <li>Validez la capture avant de passer au BL suivant</li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}