import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { getSupabaseClient } from './config/supabaseRest';
import routes from './routes';
import { 
  rateLimitMiddleware, 
  errorHandler, 
  notFoundHandler, 
  requestLogger, 
  corsOptions, 
  securityHeaders 
} from './middleware';

// Configuration
dotenv.config();

class Server {
  private app: express.Application;
  private port: number;
  private supabase: any;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001');
    // this.supabase = getSupabaseClient();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.createDirectories();
  }

  private initializeMiddleware(): void {
    // Sécurité
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS
    this.app.use(cors(corsOptions));

    // Headers de sécurité personnalisés
    this.app.use(securityHeaders);

    // Compression
    this.app.use(compression());

    // Rate limiting
    this.app.use(rateLimitMiddleware);

    // Logging des requêtes
    if (process.env.NODE_ENV === 'production') {
      this.app.use(morgan('combined'));
    } else {
      this.app.use(morgan('dev'));
      this.app.use(requestLogger);
    }

    // Parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Servir les fichiers statiques
    this.app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
    this.app.use('/reports', express.static(path.join(process.cwd(), 'reports')));
  }

  private initializeRoutes(): void {
    // Routes API
    this.app.use('/api', routes);

    // Route de base
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'API BL Management Aegean',
        version: process.env.API_VERSION || 'v1',
        documentation: '/api/health',
        timestamp: new Date().toISOString()
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  private createDirectories(): void {
    const dirs = ['uploads', 'reports', 'logs'];
    
    dirs.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Répertoire créé: ${dir}`);
      }
    });
  }

  private async connectDatabase(): Promise<void> {
    try {
      const connectionTest = await this.supabase.testConnection();
      if (connectionTest.success) {
        console.log('✅ Connexion Supabase REST établie');
      } else {
        throw new Error(connectionTest.message);
      }
    } catch (error) {
      console.error('❌ Erreur de connexion Supabase:', error);
      process.exit(1);
    }
  }

  public async start(): Promise<void> {
    try {
      // Connexion à la base de données (désactivée pour la simulation)
      // await this.connectDatabase();

      // Démarrage du serveur
      this.app.listen(this.port, () => {
        console.log('🚀 ========================================');
        console.log(`🚀 API BL Management démarrée sur le port ${this.port}`);
        console.log(`🚀 Environnement: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🚀 URL: http://localhost:${this.port}`);
        console.log(`🚀 Health check: http://localhost:${this.port}/api/health`);
        console.log('🚀 ========================================');
      });

      // Gestion gracieuse de l'arrêt
      this.setupGracefulShutdown();

    } catch (error) {
      console.error('❌ Erreur lors du démarrage du serveur:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n📴 Réception du signal ${signal}, arrêt gracieux en cours...`);
      
      try {
        console.log('✅ Arrêt gracieux terminé');
        process.exit(0);
      } catch (error) {
        console.error('❌ Erreur lors de l\'arrêt gracieux:', error);
        process.exit(1);
      }
    };

    // Signaux d'arrêt
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Gestion des erreurs non capturées
    process.on('uncaughtException', (error) => {
      console.error('❌ Erreur non capturée:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Rejet de promesse non géré:', reason);
      gracefulShutdown('unhandledRejection');
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getSupabase() {
    return this.supabase;
  }
}

// Démarrage du serveur si ce fichier est exécuté directement
if (require.main === module) {
  const server = new Server();
  server.start();
}

export default Server;