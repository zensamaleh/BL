"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploadSchema = exports.blFiltersSchema = exports.paginationSchema = exports.generateReportSchema = exports.updatePaletteSchema = exports.createPaletteSchema = exports.updateEcartSchema = exports.createEcartSchema = exports.validateBLSchema = exports.updateBLSchema = exports.createBLSchema = exports.updateUserSchema = exports.createUserSchema = exports.loginSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.loginSchema = joi_1.default.object({
    username: joi_1.default.string().min(3).max(50).required().messages({
        'string.min': 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
        'string.max': 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères',
        'any.required': 'Le nom d\'utilisateur est requis'
    }),
    password: joi_1.default.string().min(6).required().messages({
        'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
        'any.required': 'Le mot de passe est requis'
    })
});
exports.createUserSchema = joi_1.default.object({
    username: joi_1.default.string().min(3).max(50).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    role: joi_1.default.string().valid('chauffeur', 'agent', 'chef').required(),
    nom_complet: joi_1.default.string().min(2).max(100).required(),
    telephone: joi_1.default.string().pattern(/^\+?[0-9]{10,15}$/).optional().allow(''),
    actif: joi_1.default.boolean().default(true)
});
exports.updateUserSchema = joi_1.default.object({
    email: joi_1.default.string().email().optional(),
    password: joi_1.default.string().min(6).optional(),
    nom_complet: joi_1.default.string().min(2).max(100).optional(),
    telephone: joi_1.default.string().pattern(/^\+?[0-9]{10,15}$/).optional().allow(''),
    actif: joi_1.default.boolean().optional()
});
exports.createBLSchema = joi_1.default.object({
    numero_bl: joi_1.default.string().min(1).max(50).required().messages({
        'string.min': 'Le numéro de BL ne peut pas être vide',
        'string.max': 'Le numéro de BL ne peut pas dépasser 50 caractères',
        'any.required': 'Le numéro de BL est requis'
    }),
    montant_total: joi_1.default.number().min(0).precision(2).required().messages({
        'number.min': 'Le montant total doit être positif',
        'any.required': 'Le montant total est requis'
    }),
    nombre_palettes: joi_1.default.number().integer().min(1).max(50).required().messages({
        'number.min': 'Le nombre de palettes doit être d\'au moins 1',
        'number.max': 'Le nombre de palettes ne peut pas dépasser 50',
        'any.required': 'Le nombre de palettes est requis'
    }),
    date_preparation: joi_1.default.date().iso().required().messages({
        'date.format': 'La date de préparation doit être au format ISO (YYYY-MM-DD)',
        'any.required': 'La date de préparation est requise'
    }),
    notes: joi_1.default.string().max(1000).optional().allow('')
});
exports.updateBLSchema = joi_1.default.object({
    montant_total: joi_1.default.number().min(0).precision(2).optional(),
    nombre_palettes: joi_1.default.number().integer().min(1).max(50).optional(),
    date_preparation: joi_1.default.date().iso().optional(),
    date_reception: joi_1.default.date().iso().optional(),
    date_saisie: joi_1.default.date().iso().optional(),
    statut: joi_1.default.string().valid('capture', 'en_attente', 'valide', 'rejete', 'integre').optional(),
    notes: joi_1.default.string().max(1000).optional().allow(''),
    notes_ecart: joi_1.default.string().max(1000).optional().allow('')
});
exports.validateBLSchema = joi_1.default.object({
    statut: joi_1.default.string().valid('valide', 'rejete').required().messages({
        'any.only': 'Le statut doit être soit "valide" soit "rejete"',
        'any.required': 'Le statut est requis'
    }),
    notes_ecart: joi_1.default.string().max(1000).optional().allow('').messages({
        'string.max': 'Les notes d\'écart ne peuvent pas dépasser 1000 caractères'
    })
});
exports.createEcartSchema = joi_1.default.object({
    bl_id: joi_1.default.string().uuid().required().messages({
        'string.guid': 'L\'ID du BL doit être un UUID valide',
        'any.required': 'L\'ID du BL est requis'
    }),
    type_ecart: joi_1.default.string().valid('manquant', 'surplus', 'endommage', 'montant_incorrect').required(),
    description: joi_1.default.string().min(10).max(1000).required().messages({
        'string.min': 'La description doit contenir au moins 10 caractères',
        'string.max': 'La description ne peut pas dépasser 1000 caractères',
        'any.required': 'La description est requise'
    }),
    montant_ecart: joi_1.default.number().precision(2).optional().allow(null)
});
exports.updateEcartSchema = joi_1.default.object({
    type_ecart: joi_1.default.string().valid('manquant', 'surplus', 'endommage', 'montant_incorrect').optional(),
    description: joi_1.default.string().min(10).max(1000).optional(),
    montant_ecart: joi_1.default.number().precision(2).optional().allow(null),
    statut: joi_1.default.string().valid('en_cours', 'resolu', 'confirme').optional()
});
exports.createPaletteSchema = joi_1.default.object({
    numero_palette: joi_1.default.string().min(1).max(50).required(),
    bl_id: joi_1.default.string().uuid().required(),
    date_stockage: joi_1.default.date().iso().required(),
    emplacement: joi_1.default.string().max(100).optional().allow(''),
    notes: joi_1.default.string().max(1000).optional().allow('')
});
exports.updatePaletteSchema = joi_1.default.object({
    date_recuperation: joi_1.default.date().iso().optional(),
    statut: joi_1.default.string().valid('stockee', 'recuperee').optional(),
    emplacement: joi_1.default.string().max(100).optional().allow(''),
    notes: joi_1.default.string().max(1000).optional().allow('')
});
exports.generateReportSchema = joi_1.default.object({
    type_rapport: joi_1.default.string().valid('mensuel', 'hebdomadaire', 'personnalise').required(),
    periode_debut: joi_1.default.date().iso().required(),
    periode_fin: joi_1.default.date().iso().min(joi_1.default.ref('periode_debut')).required().messages({
        'date.min': 'La date de fin doit être postérieure à la date de début'
    }),
    nom_rapport: joi_1.default.string().min(1).max(200).optional()
});
exports.paginationSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    sortBy: joi_1.default.string().optional(),
    sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc')
});
exports.blFiltersSchema = joi_1.default.object({
    statut: joi_1.default.string().valid('capture', 'en_attente', 'valide', 'rejete', 'integre').optional(),
    chauffeur_id: joi_1.default.string().uuid().optional(),
    agent_id: joi_1.default.string().uuid().optional(),
    date_debut: joi_1.default.date().iso().optional(),
    date_fin: joi_1.default.date().iso().min(joi_1.default.ref('date_debut')).optional(),
    numero_bl: joi_1.default.string().optional(),
    montant_min: joi_1.default.number().min(0).optional(),
    montant_max: joi_1.default.number().min(joi_1.default.ref('montant_min')).optional()
});
exports.fileUploadSchema = joi_1.default.object({
    file: joi_1.default.object({
        fieldname: joi_1.default.string().required(),
        originalname: joi_1.default.string().required(),
        encoding: joi_1.default.string().required(),
        mimetype: joi_1.default.string().valid('image/jpeg', 'image/png', 'image/gif', 'application/pdf').required().messages({
            'any.only': 'Seuls les fichiers JPEG, PNG, GIF et PDF sont autorisés'
        }),
        size: joi_1.default.number().max(10485760).required().messages({
            'number.max': 'La taille du fichier ne peut pas dépasser 10 MB'
        })
    }).required()
});
//# sourceMappingURL=schemas.js.map