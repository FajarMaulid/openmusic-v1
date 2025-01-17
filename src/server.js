require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const songs = require('./api/songs');
const SongsService = require('./services/SongsService');
const SongsValidator = require('./validators/songs');

const albums = require('./api/albums');
const AlbumsService = require('./services/AlbumsService');
const AlbumsValidator = require('./validators/albums');

const users = require('./api/users');
const UsersService = require('./services/UsersService');
const UsersValidator = require('./validators/users');

const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validators/authentications');

const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/CollaborationsService');
const CollaborationsValidator = require('./validators/collaborations');

const playlists = require('./api/playlists');
const PlaylistsService = require('./services/PlaylistsService');
const PlaylistsValidator = require('./validators/playlists');

const playlistsSongs = require('./api/playlistsSongs');
const PlaylistsSongsService = require('./services/PlaylistsSongsService');
const PlaylistsSongsValidator = require('./validators/playlistsSongs');

const playlistsSongsActivities = require('./api/playlistsSongsActivities');
const PlaylistsSongsActivitiesService = require('./services/PlaylistsSongsActivitiesService');

const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const collaborationsService = new CollaborationsService();
  const authenticationsService = new AuthenticationsService();
  const usersService = new UsersService();
  const songsService = new SongsService();
  const albumsService = new AlbumsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistsSongsService = new PlaylistsSongsService();
  const playlistsSongsActivitiesService = new PlaylistsSongsActivitiesService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        albumsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: playlistsSongs,
      options: {
        playlistsService,
        playlistsSongsService,
        activitiesService: playlistsSongsActivitiesService,
        songsService,
        validator: PlaylistsSongsValidator,
      },
    },
    {
      plugin: playlistsSongsActivities,
      options: {
        activitiesService: playlistsSongsActivitiesService,
        playlistsService,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }
      console.error(response);

      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
