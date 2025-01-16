const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class PlaylistsSongsService {
  constructor() {
    this._pool = Pool;
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist_song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke dalam playlist');
    }
  }

  async getPlaylistWithSong(playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username,
      COALESCE(
          json_agg(
              jsonb_build_object(
                  'id', songs.id, 
                  'title', songs.title, 
                  'performer', songs.performer
              )
          ) FILTER (WHERE songs.id IS NOT NULL), 
          '[]'
      ) AS songs
      FROM playlists
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN playlists_songs ON playlists_songs.playlist_id = playlists.id
      LEFT JOIN songs ON songs.id = playlists_songs.song_id = songs.id
      WHERE playlists.id = $1
      GROUP BY playlists.id`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlists_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new NotFoundError('Lagu tidak dapat dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistsSongsService;
