import pubsub from '../../dataSources/pubsub';

const Event = {
  Query: {
    findEvents: async (_, { identifier, password }, { dataSources }) => {
      console.log('dataSources: ', dataSources);

      try {
        const response = await dataSources.manager.findEvents();

        return response;
      } catch (err) {
        return err;
      }
    },
  },

  Mutation: {
    submitEventComment: async (_, parent, context) => ({
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
