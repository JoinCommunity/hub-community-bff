import speakers from './speakers';
import agendas from './agendas';

const managerIntegration = ({ headers }) => ({
  ...speakers({ headers }),
  ...agendas({ headers }),
});

export default managerIntegration;
