"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class Database {
    constructor() {
        process.env.NODE_OPTIONS = '--dns-result-order=ipv4first';
        const config = {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 10,
            idleTimeoutMillis: 20000,
            connectionTimeoutMillis: 15000,
            statement_timeout: 30000,
            query_timeout: 30000,
        };
        const poolConfig = {
            ...config,
            options: '--client_encoding=UTF8 --application_name=aegean-bl-app',
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000,
        };
        console.log('🔗 Configuration de connexion à la base de données:', {
            connectionString: config.connectionString?.substring(0, 50) + '...',
            ssl: 'enabled',
            maxConnections: config.max
        });
        this.pool = new pg_1.Pool(poolConfig);
        this.pool.on('connect', (client) => {
            console.log('✅ Nouvelle connexion établie à la base de données');
            client.query('SET statement_timeout = \'30s\'');
            client.query('SET lock_timeout = \'30s\'');
        });
        this.pool.on('error', (err, client) => {
            console.error('❌ Erreur inattendue sur client inactif', {
                message: err.message,
                code: err.code,
                errno: err.errno
            });
        });
        this.pool.on('acquire', () => {
            console.log('🔄 Connexion acquise du pool');
        });
        this.pool.on('remove', () => {
            console.log('🗑️ Connexion supprimée du pool');
        });
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    getPool() {
        return this.pool;
    }
    async query(text, params) {
        const start = Date.now();
        const client = await this.pool.connect();
        try {
            const result = await client.query(text, params);
            const duration = Date.now() - start;
            console.log('Requête exécutée', { text, duration, rows: result.rowCount });
            return result;
        }
        catch (error) {
            console.error('Erreur lors de l\'exécution de la requête', { text, error });
            throw error;
        }
        finally {
            client.release();
        }
    }
    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async healthCheck() {
        const maxRetries = 3;
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🎯 Tentative de connexion ${attempt}/${maxRetries}...`);
                const client = await this.pool.connect();
                const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
                client.release();
                console.log('✅ Connexion réussie:', {
                    time: result.rows[0].current_time,
                    version: result.rows[0].pg_version.split(' ')[0]
                });
                return true;
            }
            catch (error) {
                lastError = error;
                console.warn(`⚠️ Tentative ${attempt} échouée:`, {
                    message: error.message,
                    code: error.code,
                    errno: error.errno
                });
                if (attempt < maxRetries) {
                    const delay = attempt * 2000;
                    console.log(`⏳ Attente ${delay}ms avant nouvelle tentative...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        console.error('❌ Health check failed après', maxRetries, 'tentatives:', lastError.message);
        return false;
    }
    async testConnection() {
        try {
            console.log('🔍 Test de connexion détaillé...');
            const client = await this.pool.connect();
            try {
                const timeResult = await client.query('SELECT NOW() as server_time');
                const versionResult = await client.query('SELECT version() as pg_version');
                const dbResult = await client.query('SELECT current_database() as database_name');
                const details = {
                    server_time: timeResult.rows[0].server_time,
                    pg_version: versionResult.rows[0].pg_version.split(' ')[0],
                    database_name: dbResult.rows[0].database_name,
                    pool_total: this.pool.totalCount,
                    pool_idle: this.pool.idleCount,
                    pool_waiting: this.pool.waitingCount
                };
                client.release();
                return {
                    success: true,
                    message: 'Connexion établie avec succès',
                    details
                };
            }
            catch (queryError) {
                client.release();
                throw queryError;
            }
        }
        catch (error) {
            return {
                success: false,
                message: `Erreur de connexion: ${error.message}`,
                details: {
                    code: error.code,
                    errno: error.errno,
                    address: error.address,
                    port: error.port
                }
            };
        }
    }
    async close() {
        await this.pool.end();
        console.log('🔌 Connexions à la base de données fermées');
    }
}
exports.default = Database;
//# sourceMappingURL=database.js.map