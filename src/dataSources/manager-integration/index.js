import speakers from './speakers';

const managerIntegration = ({ headers }) => ({
  ...speakers({ headers }),
});

export default managerIntegration;
