import { AuthService } from '../services/auth.service.js';
export const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
            const user = AuthService.verifyToken(token);
            if (user) {
                req.user = user;
                return next();
            }
        }
    }
    return res.status(401).json({ message: 'Unauthorized' });
};
export const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        return next();
    }
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
};
//# sourceMappingURL=auth.middleware.js.map