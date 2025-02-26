import manager from './manager';

export default (headers) => ({
  manager: manager(headers),
});
