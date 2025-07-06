import dotenv from 'dotenv';

dotenv.config();

const Tag = {
  Tag: {
    id: ({ documentId }) => documentId,
  },

  Query: {
    tags: async (_, { filters, sort, pagination, search }, { dataSources }) => {
      try {
        const response = await dataSources.manager.findTags(filters, sort, pagination, search);
        return response;
      } catch (err) {
        throw new Error(`Error fetching tags: ${err.message}`);
      }
    },

    tag: async (_, { id }, { dataSources }) => {
      try {
        const response = await dataSources.manager.findTagById(id);
        return response.data;
      } catch (err) {
        throw new Error(`Error fetching tag: ${err.message}`);
      }
    },
  },
};

export default Tag; 