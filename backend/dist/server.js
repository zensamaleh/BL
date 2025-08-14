"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const routes_1 = __importDefault(require("./routes"));
const middleware_1 = require("./middleware");
dotenv_1.default.config();
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || '3001');
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
        this.createDirectories();
    }
    initializeMiddleware() {
        this.app.use((0, helmet_1.default)({
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
        this.app.use((0, cors_1.default)(middleware_1.corsOptions));
        this.app.use(middleware_1.securityHeaders);
        this.app.use((0, compression_1.default)());
        this.app.use(middleware_1.rateLimitMiddleware);
        if (process.env.NODE_ENV === 'production') {
            this.app.use((0, morgan_1.default)('combined'));
        }
        else {
            this.app.use((0, morgan_1.default)('dev'));
            this.app.use(middleware_1.requestLogger);
        }
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
        this.app.use('/reports', express_1.default.static(path_1.default.join(process.cwd(), 'reports')));
    }
    initializeRoutes() {
        this.app.use('/api', routes_1.default);
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
    initializeErrorHandling() {
        this.app.use(middleware_1.notFoundHandler);
        this.app.use(middleware_1.errorHandler);
    }
    createDirectories() {
        const dirs = ['uploads', 'reports', 'logs'];
        dirs.forEach(dir => {
            const dirPath = path_1.default.join(process.cwd(), dir);
            if (!fs_1.default.existsSync(dirPath)) {
                fs_1.default.mkdirSync(dirPath, { recursive: true });
                console.log(`📁 Répertoire créé: ${dir}`);
            }
        });
    }
    async connectDatabase() {
        try {
            const connectionTest = await this.supabase.testConnection();
            if (connectionTest.success) {
                console.log('✅ Connexion Supabase REST établie');
            }
            else {
                throw new Error(connectionTest.message);
            }
        }
        catch (error) {
            console.error('❌ Erreur de connexion Supabase:', error);
            process.exit(1);
        }
    }
    async start() {
        try {
            this.app.listen(this.port, () => {
                console.log('🚀 ========================================');
                console.log(`🚀 API BL Management démarrée sur le port ${this.port}`);
                console.log(`🚀 Environnement: ${process.env.NODE_ENV || 'development'}`);
                console.log(`🚀 URL: http://localhost:${this.port}`);
                console.log(`🚀 Health check: http://localhost:${this.port}/api/health`);
                console.log('🚀 ========================================');
            });
            this.setupGracefulShutdown();
        }
        catch (error) {
            console.error('❌ Erreur lors du démarrage du serveur:', error);
            process.exit(1);
        }
    }
    setupGracefulShutdown() {
        const gracefulShutdown = async (signal) => {
            console.log(`\n📴 Réception du signal ${signal}, arrêt gracieux en cours...`);
            try {
                console.log('✅ Arrêt gracieux terminé');
                process.exit(0);
            }
            catch (error) {
                console.error('❌ Erreur lors de l\'arrêt gracieux:', error);
                process.exit(1);
            }
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('uncaughtException', (error) => {
            console.error('❌ Erreur non capturée:', error);
            gracefulShutdown('uncaughtException');
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Rejet de promesse non géré:', reason);
            gracefulShutdown('unhandledRejection');
        });
    }
    getApp() {
        return this.app;
    }
    getSupabase() {
        return this.supabase;
    }
}
if (require.main === module) {
    const server = new Server();
    server.start();
}
exports.default = Server;
//# sourceMappingURL=server.js.map