/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';

import dotenv from 'dotenv';
import graphqlUtils from '../../utils/graphqlUtils';

dotenv.config();

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
  
  // Add filters
  Object.keys(filters).forEach((key, index) => {
    if (filters[key] && typeof filters[key] === 'object') {
      Object.keys(filters[key]).forEach((op) => {
        if (filters[key][op] !== undefined) {
          params.append(`filters[${key}][${op}]`, filters[key][op]);
        }
      });
    }
  });
  
  // Add sort
  sort.forEach((sortItem, index) => {
    if (sortItem.field && sortItem.order) {
      params.append(`sort[${index}]`, `${sortItem.field}:${sortItem.order.toLowerCase()}`);
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
    'community',
    'location',
    'tags'
  ];
  
  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/events${query ? `?${query}` : ''}`;
  
  return await fetch(route, 'GET');
};

const findEventById = async (id) => {
  const populate = [
    'talks.speakers',
    'talks.speakers.avatar',
    'images',
    'community',
    'location',
    'tags'
  ];
  
  const query = buildQuery({}, [], {}, '', populate);
  const route = `/events/${id}${query ? `?${query}` : ''}`;
  
  return await fetch(route, 'GET');
};

// Community methods
const findCommunities = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = [
    'events',
    'tags',
    'locations',
    'organizers',
    'images'
  ];
  
  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/communities${query ? `?${query}` : ''}`;
  
  return await fetch(route, 'GET');
};

const findCommunityById = async (id) => {
  const populate = [
    'events',
    'tags',
    'locations',
    'organizers',
    'images'
  ];
  
  const query = buildQuery({}, [], {}, '', populate);
  const route = `/communities/${id}${query ? `?${query}` : ''}`;
  
  return await fetch(route, 'GET');
};

// Talk methods
const findTalks = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = [
    'speakers',
    'speakers.avatar',
    'event'
  ];
  
  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/talks${query ? `?${query}` : ''}`;
  
  return await fetch(route, 'GET');
};

const findTalkById = async (id) => {
  const populate = [
    'speakers',
    'speakers.avatar',
    'event'
  ];
  
  const query = buildQuery({}, [], {}, '', populate);
  const route = `/talks/${id}${query ? `?${query}` : ''}`;
  
  return await fetch(route, 'GET');
};

// Speaker methods
const findSpeakers = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = [
    'talks',
    'avatar'
  ];
  
  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/speakers${query ? `?${query}` : ''}`;
  
  return await fetch(route, 'GET');
};

const findSpeakerById = async (id) => {
  const populate = [
    'talks',
    'avatar'
  ];
  
  const query = buildQuery({}, [], {}, '', populate);
  const route = `/speakers/${id}${query ? `?${query}` : ''}`;
  
  return await fetch(route, 'GET');
};

// Location methods
const findLocations = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = [
    'events',
    'communities'
  ];
  
  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/locations${query ? `?${query}` : ''}`;
  
  return await fetch(route, 'GET');
};

const findLocationById = async (id) => {
  const populate = [
    'events',
    'communities'
  ];
  
  const query = buildQuery({}, [], {}, '', populate);
  const route = `/locations/${id}${query ? `?${query}` : ''}`;
  
  return await fetch(route, 'GET');
};

// Tag methods
const findTags = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = [
    'events',
    'communities'
  ];
  
  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/tags${query ? `?${query}` : ''}`;
  
  return await fetch(route, 'GET');
};

const findTagById = async (id) => {
  const populate = [
    'events',
    'communities'
  ];
  
  const query = buildQuery({}, [], {}, '', populate);
  const route = `/tags/${id}${query ? `?${query}` : ''}`;
  
  return await fetch(route, 'GET');
};

// User methods
const findUsers = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = [
    'communities'
  ];
  
  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/users${query ? `?${query}` : ''}`;
  
  return await fetch(route, 'GET');
};

const findUserById = async (id) => {
  const populate = [
    'communities'
  ];
  
  const query = buildQuery({}, [], {}, '', populate);
  const route = `/users/${id}${query ? `?${query}` : ''}`;
  
  return await fetch(route, 'GET');
};

// Comment methods
const findComments = async (filters = {}, sort = [], pagination = {}, search = '') => {
  const populate = [
    'user',
    'event'
  ];
  
  const query = buildQuery(filters, sort, pagination, search, populate);
  const route = `/comments${query ? `?${query}` : ''}`;
  
  return await fetch(route, 'GET');
};

const findCommentById = async (id) => {
  const populate = [
    'user',
    'event'
  ];
  
  const query = buildQuery({}, [], {}, '', populate);
  const route = `/comments/${id}${query ? `?${query}` : ''}`;
  
  return await fetch(route, 'GET');
};

export default (headers) => ({
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
});
