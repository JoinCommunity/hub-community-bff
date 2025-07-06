import dotenv from 'dotenv';

dotenv.config();

const Talk = {
  Talk: {
    id: ({ documentId }) => documentId,
  },

  Query: {
    talks: async (_, { filters, sort, pagination, search }, { dataSources }) => {
      try {
        const response = await dataSources.manager.findTalks(filters, sort, pagination, search);
        return response;
      } catch (err) {
        throw new Error(`Error fetching talks: ${err.message}`);
      }
    },

    talk: async (_, { id }, { dataSources }) => {
      try {
        const response = await dataSources.manager.findTalkById(id);
        return response.data;
      } catch (err) {
        throw new Error(`Error fetching talk: ${err.message}`);
      }
    },
  },
};

export default Talk; 