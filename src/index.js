import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import instanceRoutes from './routes/instance.routes.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/instances', instanceRoutes);
// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});
// Start server
app.listen(PORT, () => {
    console.log(`Openclaw Orchestrator Backend running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map