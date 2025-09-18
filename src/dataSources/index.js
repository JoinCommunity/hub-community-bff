import manager from './manager';
import managerPublic from './manager-public';

export default (headers) => ({
  manager: manager(headers),
  managerPublic: managerPublic({ headers }),
});
