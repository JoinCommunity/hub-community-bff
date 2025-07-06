import dotenv from 'dotenv';

dotenv.config();

const Comment = {
  Query: {
    comments: async (_, { filters, sort, pagination, search }, { dataSources }) => {
      try {
        const response = await dataSources.manager.findComments(filters, sort, pagination, search);
        return response;
      } catch (err) {
        throw new Error(`Error fetching comments: ${err.message}`);
      }
    },

    comment: async (_, { id }, { dataSources }) => {
      try {
        const response = await dataSources.manager.findCommentById(id);
        return response.data;
      } catch (err) {
        throw new Error(`Error fetching comment: ${err.message}`);
      }
    },
  },
};

export default Comment; 