import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  connectionString: string;
  ssl: boolean | { rejectUnauthorized: boolean };
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  statement_timeout: number;
  query_timeout: number;
}

class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    // Forcer l'utilisation d'IPv4 pour éviter les problèmes IPv6
    process.env.NODE_OPTIONS = '--dns-result-order=ipv4first';
    
    const config: DatabaseConfig = {
      connectionString: process.env.DATABASE_URL!,
      ssl: { rejectUnauthorized: false },
      max: 10, // Réduire le nombre de connexions
      idleTimeoutMillis: 20000,
      connectionTimeoutMillis: 15000, // Augmenter le timeout
      statement_timeout: 30000,
      query_timeout: 30000,
    };

    // Ajouter des options spécifiques pour IPv4
    const poolConfig = {
      ...config,
      // Forcer l'utilisation d'IPv4
      options: '--client_encoding=UTF8 --application_name=aegean-bl-app',
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    };

    console.log('🔗 Configuration de connexion à la base de données:', {
      connectionString: config.connectionString?.substring(0, 50) + '...',
      ssl: 'enabled',
      maxConnections: config.max
    });

    this.pool = new Pool(poolConfig);
    
    // Event listeners pour le monitoring
    this.pool.on('connect', (client) => {
      console.log('✅ Nouvelle connexion établie à la base de données');
      // Configurer le client
      client.query('SET statement_timeout = \'30s\'');
      client.query('SET lock_timeout = \'30s\'');
    });

    this.pool.on('error', (err: any, client) => {
      console.error('❌ Erreur inattendue sur client inactif', {
        message: err.message,
        code: err.code,
        errno: err.errno
      });
      // Ne pas exit automatiquement, laisser l'application gérer
    });

    this.pool.on('acquire', () => {
      console.log('🔄 Connexion acquise du pool');
    });

    this.pool.on('remove', () => {
      console.log('🗑️ Connexion supprimée du pool');
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(text, params);
      const duration = Date.now() - start;
      console.log('Requête exécutée', { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la requête', { text, error });
      throw error;
    } finally {
      client.release();
    }
  }

  public async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async healthCheck(): Promise<boolean> {
    const maxRetries = 3;
    let lastError: any;
    
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
      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ Tentative ${attempt} échouée:`, {
          message: error.message,
          code: error.code,
          errno: error.errno
        });
        
        if (attempt < maxRetries) {
          const delay = attempt * 2000; // Backoff progressif
          console.log(`⏳ Attente ${delay}ms avant nouvelle tentative...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error('❌ Health check failed après', maxRetries, 'tentatives:', lastError.message);
    return false;
  }

  public async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🔍 Test de connexion détaillé...');
      
      // Test avec pool existant
      const client = await this.pool.connect();
      
      try {
        // Tests de base
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
        
      } catch (queryError) {
        client.release();
        throw queryError;
      }
      
    } catch (error: any) {
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

  public async close(): Promise<void> {
    await this.pool.end();
    console.log('🔌 Connexions à la base de données fermées');
  }
}

export default Database;