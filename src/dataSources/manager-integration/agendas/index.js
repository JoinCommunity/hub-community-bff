import managerNetworkUtils from '../../../utils/network/manager';

const { fetch, buildQuery } = managerNetworkUtils;

const findAgendas = async (
  { filters = {}, sort = [], pagination = {}, search = '', populate = [] },
  headers,
) => {
  const query = buildQuery(filters, sort, pagination, search, populate);

  console.log('query: ', query);

  const route = `/agendas${query ? `?${query}` : ''}`;
  return fetch(route, 'GET', headers);
};

const agendas = ({ headers }) => ({
  findAgendas: (args) => findAgendas(args, headers),
});

export default agendas;
