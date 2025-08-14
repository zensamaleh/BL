interface SupabaseConfig {
    url: string;
    serviceRoleKey: string;
}
interface SupabaseResponse<T = any> {
    data?: T[];
    error?: {
        message: string;
        details?: string;
        hint?: string;
        code?: string;
    };
    count?: number;
    status?: number;
    statusText?: string;
}
declare class SupabaseRestClient {
    private baseUrl;
    private apiKey;
    private headers;
    constructor(config: SupabaseConfig);
    select<T = any>(table: string, columns?: string, filters?: Record<string, any>): Promise<SupabaseResponse<T>>;
    insert<T = any>(table: string, data: Record<string, any> | Record<string, any>[]): Promise<SupabaseResponse<T>>;
    update<T = any>(table: string, data: Record<string, any>, filters: Record<string, any>): Promise<SupabaseResponse<T>>;
    delete<T = any>(table: string, filters: Record<string, any>): Promise<SupabaseResponse<T>>;
    rpc<T = any>(functionName: string, params?: Record<string, any>): Promise<SupabaseResponse<T>>;
    testConnection(): Promise<{
        success: boolean;
        message: string;
        details?: any;
    }>;
}
export declare const getSupabaseClient: () => SupabaseRestClient;
export default SupabaseRestClient;
//# sourceMappingURL=supabaseRest.d.ts.map