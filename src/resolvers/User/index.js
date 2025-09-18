import dotenv from 'dotenv';

dotenv.config();

const User = {
  User: {
    id: ({ documentId }) => documentId,
  },

  Query: {
    users: async (_, { filters, sort, pagination, search }, { dataSources }) => {
      try {
        const response = await dataSources.manager.findUsers(filters, sort, pagination, search);
        return response;
      } catch (err) {
        throw new Error(`Error fetching users: ${err.message}`);
      }
    },

    user: async (_, { id }, { dataSources }) => {
      try {
        const response = await dataSources.manager.findUserById(id);
        return response.data;
      } catch (err) {
        throw new Error(`Error fetching user: ${err.message}`);
      }
    },
  },

  Mutation: {
    signIn: async (_, { identifier, password }, { dataSources }) => {
      try {
        const response = await dataSources.managerPublic.signIn({ identifier, password });

        const { jwt, user } = response.data;

        return {
          ...user,
          token: jwt,
        };
      } catch (err) {
        throw new Error(`Error signing in: ${err.message}`);
      }
    },
  },
};

export default User;
