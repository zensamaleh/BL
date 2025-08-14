import express from 'express';
declare class Server {
    private app;
    private port;
    private supabase;
    constructor();
    private initializeMiddleware;
    private initializeRoutes;
    private initializeErrorHandling;
    private createDirectories;
    private connectDatabase;
    start(): Promise<void>;
    private setupGracefulShutdown;
    getApp(): express.Application;
    getSupabase(): any;
}
export default Server;
//# sourceMappingURL=server.d.ts.map