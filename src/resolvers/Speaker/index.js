import dotenv from 'dotenv';

dotenv.config();

const Speaker = {
  Speaker: {
    avatar: ({ avatar }) => {
      if (!avatar) return null;
      if (typeof avatar === 'string') {
        return avatar.startsWith('http') ? avatar : `${process.env.MANAGER_URL}${avatar}`;
      }
      return avatar?.url ? `${process.env.MANAGER_URL}${avatar.url}` : null;
    },
  },

  Query: {
    speakers: async (_, { filters, sort, pagination, search }, { dataSources }) => {
      try {
        const response = await dataSources.manager.findSpeakers(filters, sort, pagination, search);
        return response;
      } catch (err) {
        throw new Error(`Error fetching speakers: ${err.message}`);
      }
    },

    speaker: async (_, { id }, { dataSources }) => {
      try {
        const response = await dataSources.manager.findSpeakerById(id);
        return response.data;
      } catch (err) {
        throw new Error(`Error fetching speaker: ${err.message}`);
      }
    },
  },
};

export default Speaker; 