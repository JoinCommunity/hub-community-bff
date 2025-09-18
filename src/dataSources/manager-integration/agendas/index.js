import managerNetworkUtils from '../../../utils/network/manager';

const { fetch, buildQuery } = managerNetworkUtils;

const createAgenda = (data, headers) =>
  fetch('/agendas', 'POST', headers, { data });

const updateAgenda = (id, data, headers) =>
  fetch(`/agendas/${id}`, 'PUT', headers, { data });

const deleteAgenda = (id, headers) =>
  fetch(`/agendas/${id}`, 'DELETE', headers);

const findAgenda = (id, headers) => fetch(`/agendas/${id}`, 'GET', headers);

const findAgendas = async (
  { filters = {}, sort = [], pagination = {}, search = '', populate = [] },
  headers,
) => {
  const query = buildQuery(filters, sort, pagination, search, populate);

  const route = `/agendas${query ? `?${query}` : ''}`;
  return fetch(route, 'GET', headers);
};

const agendas = ({ headers }) => ({
  findAgendas: (args) => findAgendas(args, headers),
  findAgenda: (id) => findAgenda(id, headers),
  createAgenda: (data) => createAgenda(data, headers),
  updateAgenda: (id, data) => updateAgenda(id, data, headers),
  deleteAgenda: (id) => deleteAgenda(id, headers),
});

export default agendas;
