export declare class AuthService {
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hash: string): Promise<boolean>;
    static generateToken(payload: {
        userId: string;
        email: string;
        role: string;
    }): string;
    static verifyToken(token: string): any;
}
//# sourceMappingURL=auth.service.d.ts.map