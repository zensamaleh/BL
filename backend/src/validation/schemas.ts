import Joi from 'joi';

// Validation pour l'authentification
export const loginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.min': 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
    'string.max': 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères',
    'any.required': 'Le nom d\'utilisateur est requis'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
    'any.required': 'Le mot de passe est requis'
  })
});

// Validation pour créer un utilisateur
export const createUserSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('chauffeur', 'agent', 'chef').required(),
  nom_complet: Joi.string().min(2).max(100).required(),
  telephone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional().allow(''),
  actif: Joi.boolean().default(true)
});

// Validation pour mettre à jour un utilisateur
export const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  nom_complet: Joi.string().min(2).max(100).optional(),
  telephone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional().allow(''),
  actif: Joi.boolean().optional()
});

// Validation pour créer un BL
export const createBLSchema = Joi.object({
  numero_bl: Joi.string().min(1).max(50).required().messages({
    'string.min': 'Le numéro de BL ne peut pas être vide',
    'string.max': 'Le numéro de BL ne peut pas dépasser 50 caractères',
    'any.required': 'Le numéro de BL est requis'
  }),
  montant_total: Joi.number().min(0).precision(2).required().messages({
    'number.min': 'Le montant total doit être positif',
    'any.required': 'Le montant total est requis'
  }),
  nombre_palettes: Joi.number().integer().min(1).max(50).required().messages({
    'number.min': 'Le nombre de palettes doit être d\'au moins 1',
    'number.max': 'Le nombre de palettes ne peut pas dépasser 50',
    'any.required': 'Le nombre de palettes est requis'
  }),
  date_preparation: Joi.date().iso().required().messages({
    'date.format': 'La date de préparation doit être au format ISO (YYYY-MM-DD)',
    'any.required': 'La date de préparation est requise'
  }),
  notes: Joi.string().max(1000).optional().allow('')
});

// Validation pour mettre à jour un BL
export const updateBLSchema = Joi.object({
  montant_total: Joi.number().min(0).precision(2).optional(),
  nombre_palettes: Joi.number().integer().min(1).max(50).optional(),
  date_preparation: Joi.date().iso().optional(),
  date_reception: Joi.date().iso().optional(),
  date_saisie: Joi.date().iso().optional(),
  statut: Joi.string().valid('capture', 'en_attente', 'valide', 'rejete', 'integre').optional(),
  notes: Joi.string().max(1000).optional().allow(''),
  notes_ecart: Joi.string().max(1000).optional().allow('')
});

// Validation pour valider/rejeter un BL
export const validateBLSchema = Joi.object({
  statut: Joi.string().valid('valide', 'rejete').required().messages({
    'any.only': 'Le statut doit être soit "valide" soit "rejete"',
    'any.required': 'Le statut est requis'
  }),
  notes_ecart: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Les notes d\'écart ne peuvent pas dépasser 1000 caractères'
  })
});

// Validation pour créer un écart
export const createEcartSchema = Joi.object({
  bl_id: Joi.string().uuid().required().messages({
    'string.guid': 'L\'ID du BL doit être un UUID valide',
    'any.required': 'L\'ID du BL est requis'
  }),
  type_ecart: Joi.string().valid('manquant', 'surplus', 'endommage', 'montant_incorrect').required(),
  description: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'La description doit contenir au moins 10 caractères',
    'string.max': 'La description ne peut pas dépasser 1000 caractères',
    'any.required': 'La description est requise'
  }),
  montant_ecart: Joi.number().precision(2).optional().allow(null)
});

// Validation pour mettre à jour un écart
export const updateEcartSchema = Joi.object({
  type_ecart: Joi.string().valid('manquant', 'surplus', 'endommage', 'montant_incorrect').optional(),
  description: Joi.string().min(10).max(1000).optional(),
  montant_ecart: Joi.number().precision(2).optional().allow(null),
  statut: Joi.string().valid('en_cours', 'resolu', 'confirme').optional()
});

// Validation pour créer une palette stockée
export const createPaletteSchema = Joi.object({
  numero_palette: Joi.string().min(1).max(50).required(),
  bl_id: Joi.string().uuid().required(),
  date_stockage: Joi.date().iso().required(),
  emplacement: Joi.string().max(100).optional().allow(''),
  notes: Joi.string().max(1000).optional().allow('')
});

// Validation pour mettre à jour une palette stockée
export const updatePaletteSchema = Joi.object({
  date_recuperation: Joi.date().iso().optional(),
  statut: Joi.string().valid('stockee', 'recuperee').optional(),
  emplacement: Joi.string().max(100).optional().allow(''),
  notes: Joi.string().max(1000).optional().allow('')
});

// Validation pour générer un rapport
export const generateReportSchema = Joi.object({
  type_rapport: Joi.string().valid('mensuel', 'hebdomadaire', 'personnalise').required(),
  periode_debut: Joi.date().iso().required(),
  periode_fin: Joi.date().iso().min(Joi.ref('periode_debut')).required().messages({
    'date.min': 'La date de fin doit être postérieure à la date de début'
  }),
  nom_rapport: Joi.string().min(1).max(200).optional()
});

// Validation pour les paramètres de pagination
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Validation pour les filtres de recherche BL
export const blFiltersSchema = Joi.object({
  statut: Joi.string().valid('capture', 'en_attente', 'valide', 'rejete', 'integre').optional(),
  chauffeur_id: Joi.string().uuid().optional(),
  agent_id: Joi.string().uuid().optional(),
  date_debut: Joi.date().iso().optional(),
  date_fin: Joi.date().iso().min(Joi.ref('date_debut')).optional(),
  numero_bl: Joi.string().optional(),
  montant_min: Joi.number().min(0).optional(),
  montant_max: Joi.number().min(Joi.ref('montant_min')).optional()
});

// Validation pour upload de fichier
export const fileUploadSchema = Joi.object({
  file: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().valid(
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf'
    ).required().messages({
      'any.only': 'Seuls les fichiers JPEG, PNG, GIF et PDF sont autorisés'
    }),
    size: Joi.number().max(10485760).required().messages({
      'number.max': 'La taille du fichier ne peut pas dépasser 10 MB'
    })
  }).required()
});