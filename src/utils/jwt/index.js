const decode = (token) => {
  const t = token.replace('Bearer ', '');
  return JSON.parse(Buffer.from(t.split('.')[1], 'base64').toString());
};

const jwt = {
  decode,
};

export default jwt;
