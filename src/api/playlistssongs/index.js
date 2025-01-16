const PlaylistsSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistsSongs',
  version: '1.0.0',
  register: async (server, {
    playlistsService,
    playlistsSongsService,
    activitiesService,
    songsService,
    validator,
  }) => {
    const playlistsSongsHandler = new PlaylistsSongsHandler(
      playlistsService,
      playlistsSongsService,
      activitiesService,
      songsService,
      validator,
    );
    server.route(routes(playlistsSongsHandler));
  },
};
