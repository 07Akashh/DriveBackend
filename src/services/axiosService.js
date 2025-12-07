const axios = require('axios');

module.exports = ({ method, url, headers, data = undefined, params = {} }) => {
  // Remove data for GET requests
  if (method && method.toUpperCase() === 'GET') {
    data = undefined;
  }

  return axios({
    method,
    url,
    headers,
    params,
    ...(data !== undefined ? { data } : {}),
  })
  .then(res => res) 
  .catch(err => {
    throw err;
  });
};

