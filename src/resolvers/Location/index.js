import dotenv from 'dotenv';

dotenv.config();

const Location = {
  Location: {
    id: ({ documentId }) => documentId,
  },

  Query: {
    locations: async (_, { filters, sort, pagination, search }, { dataSources }) => {
      try {
        const response = await dataSources.manager.findLocations(filters, sort, pagination, search);
        return response;
      } catch (err) {
        throw new Error(`Error fetching locations: ${err.message}`);
      }
    },

    location: async (_, { id }, { dataSources }) => {
      try {
        const response = await dataSources.manager.findLocationById(id);
        return response.data;
      } catch (err) {
        throw new Error(`Error fetching location: ${err.message}`);
      }
    },
  },
};

export default Location; 