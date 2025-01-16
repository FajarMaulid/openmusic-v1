const PlaylistsSongsActivitiesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistsSongsActivities',
  version: '1.0.0',
  register: async (server, { activitiesService, playlistsService }) => {
    const playlistsSongsActivitiesHandler = new PlaylistsSongsActivitiesHandler(
      activitiesService,
      playlistsService,
    );
    server.route(routes(playlistsSongsActivitiesHandler));
  },
};
