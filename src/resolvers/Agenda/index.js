import dotenv from 'dotenv';

dotenv.config();

const Agenda = {
  Agenda: {
    id: ({ documentId }) => documentId,

    user: (parent) => parent.users_permissions_user,
  },

  Query: {
    agendas: async (
      _,
      { filters, sort, pagination, search },
      { dataSources, user },
    ) => {
      console.log('user: ', user);

      const customFilters = {
        ...filters,
        users_permissions_user: {
          documentId: user.documentId,
        },
      };

      console.log('user: ', user);

      try {
        const response = await dataSources.managerIntegration.findAgendas({
          filters: customFilters,
          sort,
          pagination,
          search,
          populate: ['event', 'talks', 'comment', 'users_permissions_user'],
        });
        return response;
      } catch (err) {
        throw new Error(`Error fetching agendas: ${err.message}`);
      }
    },

    agenda: async (_, { id }, { dataSources }) => {
      try {
        const response = await dataSources.manager.findAgendaById(id);
        return response.data;
      } catch (err) {
        throw new Error(`Error fetching agenda: ${err.message}`);
      }
    },
  },

  Mutation: {
    createAgenda: async (_, { input }, { dataSources }) => {
      try {
        const response = await dataSources.manager.createAgenda(input);
        return response.data;
      } catch (err) {
        throw new Error(`Error creating agenda: ${err.message}`);
      }
    },

    updateAgenda: async (_, { id, input }, { dataSources }) => {
      try {
        const response = await dataSources.manager.updateAgenda(id, input);
        return response.data;
      } catch (err) {
        throw new Error(`Error updating agenda: ${err.message}`);
      }
    },

    deleteAgenda: async (_, { id }, { dataSources }) => {
      try {
        const response = await dataSources.manager.deleteAgenda(id);
        return response.data;
      } catch (err) {
        throw new Error(`Error deleting agenda: ${err.message}`);
      }
    },
  },
};

export default Agenda;
