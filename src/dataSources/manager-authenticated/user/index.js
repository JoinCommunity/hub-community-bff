import managerNetworkUtils from '../../../utils/network/manager';

const { fetch } = managerNetworkUtils;

const cachedMe = new Map();

const me = async ({ headers, userId }) => {
  if (cachedMe.has(userId)) {
    const cachedUser = cachedMe.get(userId);
    return cachedUser;
  }

  const response = await fetch('/users/me', 'GET', headers);
  cachedMe.set(userId, response);
  return response;
};

const user = ({ headers }) => ({
  me: ({ userId }) => me({ headers, userId }),
});

export default user;
