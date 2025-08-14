import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const rateLimitMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const validate: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const errorHandler: (error: any, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const corsOptions: {
    origin: string[];
    credentials: boolean;
    optionsSuccessStatus: number;
    methods: string[];
    allowedHeaders: string[];
};
export declare const securityHeaders: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=index.d.ts.map