import dotenv from 'dotenv';
import manager from './manager';
import managerPublic from './manager-public';
import managerIntegration from './manager-integration';

dotenv.config();

export default (headers) => ({
  manager: manager(headers),
  managerPublic: managerPublic({ headers }),
  managerIntegration: managerIntegration({
    headers: {
      ...headers,
      Authorization: `Bearer ${process.env.MANAGER_TOKEN_INTEGRATION}`,
    },
  }),
});
