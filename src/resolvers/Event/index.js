import dotenv from 'dotenv';
import pubsub from '../../dataSources/pubsub';

dotenv.config();

const Event = {
  Event: {
    images: ({ images }) => images.map(
      (image) => `${process.env.MANAGER_URL}${image.formats.large.url}`,
    ),
  },

  Query: {
    findEvents: async (_, __, { dataSources }) => {
      try {
        const response = await dataSources.manager.findEvents();

        return response;
      } catch (err) {
        return err;
      }
    },
  },

  Mutation: {
    submitEventComment: async (_, __, ___) => ({
      comment: 'comment',
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
