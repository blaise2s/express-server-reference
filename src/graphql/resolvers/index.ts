import merge from 'lodash.merge';
import authorizationResolvers from './authorization.resolvers';
import healthCheckResolvers from './health-check.resolvers';

export default merge(healthCheckResolvers, authorizationResolvers);
