import express from 'express';
import healthCheckRoutes from './routes/health-check.routes';

const app = express();
const prefix = '/api/auth-server/v1';

healthCheckRoutes(app, prefix);

export default app;
