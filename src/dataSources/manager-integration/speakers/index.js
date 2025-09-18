import managerNetworkUtils from '../../../utils/network/manager';

const { fetch, buildQuery } = managerNetworkUtils;

const createSpeaker = (args, headers) =>
  fetch('/speakers', 'POST', headers, { data: args });

const updateSpeaker = (args, headers) =>
  fetch(`/speakers/${args.id}`, 'PUT', headers, { data: args });

const deleteSpeaker = (args, headers) =>
  fetch('/speakers', 'DELETE', headers, { data: args });

const findSpeakers = (args, headers) => {
  const {
    filters = {},
    sort = [],
    pagination = {},
    search = '',
    populate = [],
  } = args;
  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/speakers${query ? `?${query}` : ''}`;
  return fetch(route, 'GET', headers);
};

const speakers = ({ headers }) => ({
  findSpeakers: (args) => findSpeakers(args, headers),
  createSpeaker: (args) => createSpeaker(args, headers),
  updateSpeaker: (args) => updateSpeaker(args, headers),
  deleteSpeaker: (args) => deleteSpeaker(args, headers),
});

export default speakers;
