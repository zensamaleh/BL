import { Pool } from 'pg';
declare class Database {
    private static instance;
    private pool;
    private constructor();
    static getInstance(): Database;
    getPool(): Pool;
    query(text: string, params?: any[]): Promise<any>;
    transaction<T>(callback: (client: any) => Promise<T>): Promise<T>;
    healthCheck(): Promise<boolean>;
    testConnection(): Promise<{
        success: boolean;
        message: string;
        details?: any;
    }>;
    close(): Promise<void>;
}
export default Database;
//# sourceMappingURL=database.d.ts.map