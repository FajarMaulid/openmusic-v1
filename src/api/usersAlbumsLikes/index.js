const UsersAlbumsLikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'usersAlbumsLikesService',
  version: '1.0.0',
  register: async (server, { service }) => {
    const usersAlbumsLikesHandler = new UsersAlbumsLikesHandler(service);
    server.route(routes(usersAlbumsLikesHandler));
  },
};
