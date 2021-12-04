import express from 'express';
import healthCheckRoutes from './routes/health-check.routes';

const app = express();
const prefix = '/api/v1';

healthCheckRoutes(app, prefix);

export default app;
