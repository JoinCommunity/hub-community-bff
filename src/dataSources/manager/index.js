import publicRequests from './public';
import privateRequests from './private';

const managerRequest = ({ headers }) => ({
  ...publicRequests(headers),
  ...privateRequests(headers),
});

export default managerRequest;
