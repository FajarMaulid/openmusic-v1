const PlaylistsSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistsSongs',
  version: '1.0.0',
  register: async (server, {
    playlistsService,
    playlistsSongsService,
    activitiesHandler,
    validator,
  }) => {
    const playlistsSongsHandler = new PlaylistsSongsHandler(
      playlistsService,
      playlistsSongsService,
      activitiesHandler,
      validator,
    );
    server.route(routes(playlistsSongsHandler));
  },
};
