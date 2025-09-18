import dotenv from 'dotenv';

dotenv.config();

const User = {
  User: {
    id: ({ documentId }) => documentId,
  },

  Query: {
    users: async (
      _,
      { filters, sort, pagination, search },
      { dataSources },
    ) => {
      try {
        const response = await dataSources.manager.findUsers(
          filters,
          sort,
          pagination,
          search,
        );
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
        const response = await dataSources.managerPublic.signIn({
          identifier,
          password,
        });

        const { jwt, user } = response.data;

        return {
          ...user,
          token: jwt,
        };
      } catch (err) {
        throw new Error(`Error signing in: ${err.message}`);
      }
    },

    signUp: async (_, { input }, { dataSources }) => {
      let speaker;

      const response = await dataSources.managerPublic.signUp({
        username: input.username,
        email: input.email,
        password: input.password,
      });

      const createdUser = response.data.user;

      if (createdUser) {
        try {
          const speakerResponse =
            await dataSources.managerIntegration.findSpeakers({
              filters: {
                email: createdUser.email,
              },
            });

          if (speakerResponse.data.length > 0) {
            [speaker] = speakerResponse.data;
          }
        } catch (err) {
          throw new Error(`Error fetching speaker: ${err.message}`);
        }
      }

      if (speaker) {
        try {
          const updatedSpeaker =
            await dataSources.managerIntegration.updateSpeaker(
              speaker.documentId,
              {
                users_permissions_user: {
                  set: [createdUser.documentId],
                },
              },
            );

          return {
            ...createdUser,
            speaker: updatedSpeaker.data,
          };
        } catch (err) {
          throw new Error(`Error updating speaker: ${err.message}`);
        }
      }

      if (!speaker) {
        try {
          const createdSpeaker =
            await dataSources.managerIntegration.createSpeaker({
              name: createdUser.username,
              email: input.name,
              users_permissions_user: {
                set: [createdUser.documentId],
              },
            });

          return {
            ...createdUser,
            speaker: createdSpeaker.data,
          };
        } catch (err) {
          throw new Error(`Error creating speaker: ${err.message}`);
        }
      }

      return createdUser;
    },

    forwardPassword: async (_, { email }, { dataSources }) => {
      try {
        const response = await dataSources.managerPublic.forwardPassword({
          email,
        });
        return response.data.sent;
      } catch (err) {
        throw new Error(`Error forwarding password: ${err.message}`);
      }
    },
  },
};

export default User;
