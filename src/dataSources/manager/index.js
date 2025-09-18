/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';

import dotenv from 'dotenv';
import graphqlUtils from '../../utils/graphqlUtils';

dotenv.config();

// Helper to recursively flatten filters into nested bracket notation for Strapi
const OPERATORS = new Set([
  'eq',
  'ne',
  'lt',
  'lte',
  'gt',
  'gte',
  'in',
  'notIn',
  'contains',
  'notContains',
  'containsi',
  'notContainsi',
  'null',
  'notNull',
  'between',
  'startsWith',
  'endsWith',
  'or',
  'and',
  'not',
  'some',
  'every',
  'none',
  'is',
  'notIn',
  'like',
  'notLike',
  'iLike',
  'notILike',
  'overlap',
  'contains',
  'contained',
  'any',
  'all',
  'exists',
  'regex',
  'search',
  'size',
  'elemMatch',
]);

function flattenFiltersForStrapi(obj, path = []) {
  let result = [];
  Object.keys(obj).forEach((key) => {
    if (OPERATORS.has(key)) {
      // This key is an operator, so use the path as the field path
      result.push({ path: [...path], op: key, value: obj[key] });
    } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      // Recurse deeper
      const nested = flattenFiltersForStrapi(obj[key], [...path, key]);
      result = result.concat(nested);
    } else {
      // Primitive value, treat as eq
      result.push({ path: [...path, key], op: 'eq', value: obj[key] });
    }
  });
  return result;
}

/**
 * Build query string for Strapi v5 API
 * @param {Object} filters - Filters object
 * @param {Array} sort - Sort array
 * @param {Object} pagination - Pagination object
 * @param {String} search - Search string
 * @param {Array} populate - Populate array
 * @returns {String} Query string
 */
const buildQuery = (filters = {}, sort = [], pagination = {}, search = '', populate = []) => {
  const params = new URLSearchParams();

  // Add pagination
  if (pagination.page) params.append('pagination[page]', pagination.page);
  if (pagination.pageSize) params.append('pagination[pageSize]', pagination.pageSize);

  // Add search
  if (search) {
    params.append('filters[$or][0][title][$containsi]', search);
    params.append('filters[$or][1][description][$containsi]', search);
    params.append('filters[$or][2][name][$containsi]', search);
  }

  // Add filters (flattened for Strapi with nested brackets)
  const flatFilters = flattenFiltersForStrapi(filters);
  flatFilters.forEach(({ path, op, value }) => {
    let val = value;
    if (Array.isArray(val)) {
      val = val.join(',');
    }
    // Build nested bracket notation for the path
    const field = path.reduce((acc, curr) => `${acc}[${curr}]`, 'filters');
    params.append(`${field}[$${op}]`, val);
  });

  // Add sort
  let sortIndex = 0;
  sort.forEach((sortItem) => {
    if (typeof sortItem === 'object' && sortItem !== null) {
      // Handle object-based sort (like { id: 'ASC', title: 'DESC' })
      Object.keys(sortItem).forEach((field) => {
        if (sortItem[field] && sortItem[field] !== null) {
          params.append(`sort[${sortIndex}]`, `${field}:${sortItem[field].toLowerCase()}`);
          sortIndex += 1;
        }
      });
    } else if (sortItem.field && sortItem.order) {
      // Handle array-based sort (like [{ field: 'id', order: 'ASC' }])
      params.append(`sort[${sortIndex}]`, `${sortItem.field}:${sortItem.order.toLowerCase()}`);
      sortIndex += 1;
    }
  });

  // Add populate
  populate.forEach((popItem, index) => {
    params.append(`populate[${index}]`, popItem);
  });

  return params.toString();
};

/**
 * Generic fetch function for Strapi v5
 * @param {String} route - API route
 * @param {String} method - HTTP method
 * @param {Object} customHeaders - Custom headers
 * @param {Object} body - Request body
 * @returns {Object} Response data
 */
const fetch = async (route, method, customHeaders = {}, body = null) => {
  let response;

  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const url = `${process.env.MANAGER_URL}/api${route}`;

  console.log(`[${method}] - ${decodeURIComponent(url)}`);

  try {
    response = await axios({
      method,
      url,
      headers,
      data: body,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('error: ', error.message);
    }

    throw new Error(`Error on try ${method} in ${url}`);
  }

  if (process.env.NODE_ENV === 'production') {
    console.info(`[${method}] ${route}`);
  }

  const meta = response?.data?.meta?.pagination || null;

  if (response.data.data) {
    return {
      data: graphqlUtils(response.data.data),
      meta,
    };
  }

  return {
    data: graphqlUtils(response.data),
    meta,
  };
};

// Event methods
const findEvents = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = [
    'talks.speakers',
    'talks.speakers.avatar',
    'images',
    'communities',
    'location',
    'tags',
  ];

  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/events${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

const findEventById = async (id) => {
  const populate = [
    'talks.speakers',
    'talks.speakers.avatar',
    'images',
    'communities',
    'location',
    'tags',
  ];

  const query = buildQuery({}, [], {}, '', populate);
  const route = `/events/${id}${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

// Community methods
const findCommunities = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = ['events', 'tags', 'location', 'organizers', 'images'];

  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/communities${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

const findCommunityById = async (id) => {
  const populate = ['events', 'tags', 'location', 'organizers', 'images'];

  const query = buildQuery({}, [], {}, '', populate);
  const route = `/communities/${id}${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

// Talk methods
const findTalks = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = ['speakers', 'speakers.avatar', 'event'];

  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/talks${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

const findTalkById = async (id) => {
  const populate = ['speakers', 'speakers.avatar', 'event'];

  const query = buildQuery({}, [], {}, '', populate);
  const route = `/talks/${id}${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

// Speaker methods
const findSpeakers = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = ['talks', 'avatar'];

  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/speakers${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

const findSpeakerById = async (id) => {
  const populate = ['talks', 'avatar'];

  const query = buildQuery({}, [], {}, '', populate);
  const route = `/speakers/${id}${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

// Location methods
const findLocations = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = ['events', 'communities'];

  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/locations${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

const findLocationById = async (id) => {
  const populate = ['events', 'communities'];

  const query = buildQuery({}, [], {}, '', populate);
  const route = `/locations/${id}${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

// Tag methods
const findTags = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = ['events', 'communities'];

  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/tags${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

const findTagById = async (id) => {
  const populate = ['events', 'communities'];

  const query = buildQuery({}, [], {}, '', populate);
  const route = `/tags/${id}${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

// User methods
const findUsers = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = ['communities'];

  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/users${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

const findUserById = async (id) => {
  const populate = ['communities'];

  const query = buildQuery({}, [], {}, '', populate);
  const route = `/users/${id}${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

// Comment methods
const findComments = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = ['user', 'event'];

  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/comments${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

const findCommentById = async (id) => {
  const populate = ['user', 'event'];

  const query = buildQuery({}, [], {}, '', populate);
  const route = `/comments/${id}${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

// Rate methods
const findRates = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = ['user', 'event', 'talk'];

  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/rates${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

const findRateById = async (id) => {
  const populate = ['user', 'event', 'talk'];

  const query = buildQuery({}, [], {}, '', populate);
  const route = `/rates/${id}${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

const createRate = async (input) => {
  const route = '/rates';
  return fetch(route, 'POST', {}, { data: input });
};

const updateRate = async (id, input) => {
  const route = `/rates/${id}`;
  return fetch(route, 'PUT', {}, { data: input });
};

const deleteRate = async (id) => {
  const route = `/rates/${id}`;
  return fetch(route, 'DELETE');
};

// CommentReply methods
const findCommentReplies = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = ['parent_comment', 'user_creator', 'users_taggeds'];

  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/comment-replies${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

const findCommentReplyById = async (id) => {
  const populate = ['parent_comment', 'user_creator', 'users_taggeds'];

  const query = buildQuery({}, [], {}, '', populate);
  const route = `/comment-replies/${id}${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

const createCommentReply = async (input) => {
  const route = '/comment-replies';
  return fetch(route, 'POST', {}, { data: input });
};

const updateCommentReply = async (id, input) => {
  const route = `/comment-replies/${id}`;
  return fetch(route, 'PUT', {}, { data: input });
};

const deleteCommentReply = async (id) => {
  const route = `/comment-replies/${id}`;
  return fetch(route, 'DELETE');
};

// Agenda methods
const findAgendas = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = ['event', 'talks', 'comment'];

  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/agendas${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

const findAgendaById = async (id) => {
  const populate = ['event', 'talks', 'comment'];

  const query = buildQuery({}, [], {}, '', populate);
  const route = `/agendas/${id}${query ? `?${query}` : ''}`;

  return fetch(route, 'GET');
};

const createAgenda = async (input) => {
  const route = '/agendas';
  return fetch(route, 'POST', {}, { data: input });
};

const updateAgenda = async (id, input) => {
  const route = `/agendas/${id}`;
  return fetch(route, 'PUT', {}, { data: input });
};

const deleteAgenda = async (id) => {
  const route = `/agendas/${id}`;
  return fetch(route, 'DELETE');
};

export default () => ({
  // Events
  findEvents,
  findEventById,
  // Communities
  findCommunities,
  findCommunityById,
  // Talks
  findTalks,
  findTalkById,
  // Speakers
  findSpeakers,
  findSpeakerById,
  // Locations
  findLocations,
  findLocationById,
  // Tags
  findTags,
  findTagById,
  // Users
  findUsers,
  findUserById,
  // Comments
  findComments,
  findCommentById,
  // Rates
  findRates,
  findRateById,
  createRate,
  updateRate,
  deleteRate,
  // CommentReplies
  findCommentReplies,
  findCommentReplyById,
  createCommentReply,
  updateCommentReply,
  deleteCommentReply,
  // Agendas
  findAgendas,
  findAgendaById,
  createAgenda,
  updateAgenda,
  deleteAgenda,
});
