/* eslint-disable import/no-dynamic-require */
import ramda from 'ramda';
import fs from 'fs';

const currentDir = './src/resolvers';

const resolvers = () => {
  const files = fs.readdirSync(currentDir);
  const folders = ramda.filter((item) => !item.includes('index.js'), files);

  let objectToReturn = {};

  let Query = {};
  let Mutation = {};
  let Subscription = {};

  folders.forEach((item) => {
    // eslint-disable-next-line global-require
    const resolver = require(`./${item}`);

    if (resolver.default.Query) {
      Query = { ...Query, ...resolver.default.Query };
    }

    if (resolver.default.Mutation) {
      Mutation = { ...Mutation, ...resolver.default.Mutation };
    }

    if (resolver.default.Subscription) {
      Subscription = { ...Subscription, ...resolver.default.Subscription };
    }

    objectToReturn = { ...objectToReturn, ...resolver.default };
  });

  objectToReturn = {
    ...objectToReturn, Query, Mutation, Subscription,
  };

  return objectToReturn;
};

export default resolvers;
