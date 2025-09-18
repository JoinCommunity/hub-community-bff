import managerPublicNetworkUtils from '../../../utils/network/manager';

function signIn({ identifier, password }) {
  return managerPublicNetworkUtils.fetch('/auth/local', 'POST', {}, { identifier, password });
}

const auth = ({ headers }) => ({
  signIn: (args) => signIn(args, headers),
});

export default auth;
