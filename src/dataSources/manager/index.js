/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';

import dotenv from 'dotenv';
import graphqlUtils from '../../utils/graphqlUtils';

dotenv.config();

/**
 *
 * @deprecated use method fetch instead of
 */
const request = async (route, method, customHeaders = {}, body = null) => {
  let response;

  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const url = `${process.env.MANAGER_URL}${route}`;

  try {
    response = await axios({
      method,
      url,
      headers,
      data: body,
    });
  } catch (error) {
    throw new Error(`Error on try ${method} in ${url}`);
  }

  if (process.env.NODE_ENV === 'production') {
    console.info(`[${method}] ${route}`);
  }

  if (response.data.data) {
    return graphqlUtils(response.data.data, response.data.meta);
  }
  return graphqlUtils(response.data);
};

/**
 *
 * @param {*} route route in backend
 * @param {*} method GET, POST, PUT, DELETE
 * @param {*} customHeaders map of headers {}
 * @param {*} body map of body {}
 * @returns return generic response like {data: {}, meta: {}} can throw errors too
 */
const fetch = async (route, method, customHeaders = {}, body = null) => {
  let response;

  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const url = `${process.env.MANAGER_URL}${route}`;

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

const findEvents = async () => {
  const response = await fetch('/events', 'GET', {}, {
  });

  return response.data;
};
export default (headers) => ({
  findEvents,
});
