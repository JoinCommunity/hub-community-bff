import dotenv from 'dotenv';
import pubsub from '../../dataSources/pubsub';

dotenv.config();

const Event = {
  Event: {
    images: ({ images }) => {
      if (!images || !Array.isArray(images)) return [];
      return images.map((image) => {
        if (typeof image === 'string') {
          return image.startsWith('http') ? image : `${process.env.MANAGER_URL}${image}`;
        }
        if (image?.formats?.large?.url) {
          return `${process.env.MANAGER_URL}${image.formats.large.url}`;
        }
        return image?.url ? `${process.env.MANAGER_URL}${image.url}` : null;
      }).filter(Boolean);
    },
  },

  Query: {
    events: async (_, { filters, sort, pagination, search }, { dataSources }) => {
      try {
        const response = await dataSources.manager.findEvents(filters, sort, pagination, search);
        return response;
      } catch (err) {
        throw new Error(`Error fetching events: ${err.message}`);
      }
    },

    event: async (_, { id }, { dataSources }) => {
      try {
        const response = await dataSources.manager.findEventById(id);
        return response.data;
      } catch (err) {
        throw new Error(`Error fetching event: ${err.message}`);
      }
    },

    // Legacy query for backward compatibility
    findEvents: async (_, __, { dataSources }) => {
      try {
        const response = await dataSources.manager.findEvents();
        return response.data;
      } catch (err) {
        throw new Error(`Error fetching events: ${err.message}`);
      }
    },
  },

  Mutation: {
    submitEventComment: async (_, { eventId }, ___) => ({
      comment: 'comment',
      event: { id: eventId },
    }),
  },

  Subscription: {
    commentEventAdded: {
      resolve: (payload) => payload.messageReceived,
      subscribe: (_, { eventId }) => pubsub.asyncIterator([eventId]),
    },
  },
};

export default Event;
