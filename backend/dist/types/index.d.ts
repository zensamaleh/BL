export interface User {
    id: string;
    username: string;
    email: string;
    password_hash?: string;
    role: UserRole;
    nom_complet: string;
    telephone?: string;
    actif: boolean;
    last_login?: Date;
    created_at: Date;
    updated_at: Date;
}
export type UserRole = 'chauffeur' | 'agent' | 'chef';
export interface BonLivraison {
    id: string;
    numero_bl: string;
    montant_total: number;
    nombre_palettes: number;
    date_preparation: Date;
    date_reception?: Date;
    date_saisie?: Date;
    statut: BLStatus;
    notes?: string;
    notes_ecart?: string;
    chauffeur_id: string;
    agent_id?: string;
    created_at: Date;
    updated_at: Date;
}
export type BLStatus = 'capture' | 'en_attente' | 'valide' | 'rejete' | 'integre';
export interface BLImage {
    id: string;
    bl_id: string;
    nom_fichier: string;
    chemin_fichier: string;
    taille_fichier: number;
    type_mime: string;
    created_at: Date;
}
export interface Ecart {
    id: string;
    bl_id: string;
    type_ecart: EcartType;
    description: string;
    montant_ecart?: number;
    statut: EcartStatus;
    detecte_par: string;
    created_at: Date;
    updated_at: Date;
}
export type EcartType = 'manquant' | 'surplus' | 'endommage' | 'montant_incorrect';
export type EcartStatus = 'en_cours' | 'resolu' | 'confirme';
export interface PaletteStockee {
    id: string;
    numero_palette: string;
    bl_id: string;
    date_stockage: Date;
    date_recuperation?: Date;
    statut: PaletteStatus;
    emplacement?: string;
    notes?: string;
    created_at: Date;
    updated_at: Date;
}
export type PaletteStatus = 'stockee' | 'recuperee';
export interface ActivityLog {
    id: string;
    user_id: string;
    bl_id?: string;
    action: string;
    details?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    created_at: Date;
}
export interface Rapport {
    id: string;
    nom_rapport: string;
    type_rapport: RapportType;
    periode_debut: Date;
    periode_fin: Date;
    chemin_fichier: string;
    statut: RapportStatus;
    genere_par: string;
    created_at: Date;
}
export type RapportType = 'mensuel' | 'hebdomadaire' | 'personnalise';
export type RapportStatus = 'en_cours' | 'termine' | 'erreur';
export interface LoginRequest {
    username: string;
    password: string;
}
export interface LoginResponse {
    success: boolean;
    message: string;
    data?: {
        token: string;
        refreshToken: string;
        user: Omit<User, 'password_hash'>;
    };
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
}
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface DashboardStats {
    bl_aujourd_hui: number;
    bl_en_attente: number;
    bl_valides: number;
    ecarts_detectes: number;
    palettes_stockees: number;
    montant_total_mois: number;
}
export interface MonthlyReport {
    numero_bl: string;
    montant_total: number;
    date_preparation: Date;
    date_reception?: Date;
    date_saisie?: Date;
    statut: BLStatus;
}
export interface FileUpload {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}
//# sourceMappingURL=index.d.ts.map