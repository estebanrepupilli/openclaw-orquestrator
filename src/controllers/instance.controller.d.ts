import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
export declare class InstanceController {
    static create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static start(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static stop(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static remove(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static list(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=instance.controller.d.ts.map