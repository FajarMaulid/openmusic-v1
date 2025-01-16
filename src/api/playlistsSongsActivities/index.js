const PlaylistsSongsActivitiesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistsSongsActivities',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const playlistsSongsActivitiesHandler = new PlaylistsSongsActivitiesHandler(service, validator);
    server.route(routes(playlistsSongsActivitiesHandler));
  },
};
