import dotenv from 'dotenv';

dotenv.config();

const Community = {
  Community: {
    id: ({ documentId }) => documentId,
    images: ({ images }) => {
      if (!images || !Array.isArray(images)) return [];
      return images
        .map((image) => {
          if (typeof image === 'string') {
            return image.startsWith('http')
              ? image
              : `${process.env.MANAGER_URL}${image}`;
          }
          return image?.url ? `${process.env.MANAGER_URL}${image.url}` : null;
        })
        .filter(Boolean);
    },
  },

  Query: {
    communities: async (
      _,
      { filters, sort, pagination, search },
      { dataSources },
    ) => {
      try {
        const response = await dataSources.manager.findCommunities(
          filters,
          sort,
          pagination,
          search,
        );
        return response;
      } catch (err) {
        throw new Error(`Error fetching communities: ${err.message}`);
      }
    },

    community: async (_, { id }, { dataSources }) => {
      try {
        const response = await dataSources.manager.findCommunityById(id);
        return response.data;
      } catch (err) {
        throw new Error(`Error fetching community: ${err.message}`);
      }
    },
  },
};

export default Community;
