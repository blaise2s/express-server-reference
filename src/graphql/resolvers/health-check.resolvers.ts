import { HealthCheckResponse } from '../interfaces/health-check.interfaces';

export default {
  Query: {
    ping: (): HealthCheckResponse => ({ msg: 'pong' }),
  },
};
