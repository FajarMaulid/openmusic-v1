const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const { mapDBToModel } = require('../utils/playlists');

const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class PlaylistsSongsService {
  constructor(CollaborationsService, playlistsService) {
    this._pool = Pool;
    this._collaborationsService = CollaborationsService;
    this._playlistsService = playlistsService;
  }

  async addSongToPlaylist() {

  }

  async getPlaylistWithSong() {

  }

  async deleteSongFromPlaylist() {
    
  }
}

module.exports = PlaylistsSongsService;
