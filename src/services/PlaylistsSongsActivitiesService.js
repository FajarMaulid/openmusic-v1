const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const autoBind = require('auto-bind');

const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class PlaylistsSongsActivitiesService {
  constructor() {
    this._pool = new Pool();

    autoBind(this);
  }

  async addPlaylistSongActivity(playlistId, songId, userId, action) {
    const id = `playlist_song_activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlists_songs_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Aktivitas pada playlist gagal ditambahkan');
    }
  }

  async getPlaylistSongActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlists_songs_activities.action, playlists_songs_activities.time
      FROM playlists_songs_activities
      LEFT JOIN users ON playlists_songs_activities.user_id = users.id
      LEFT JOIN songs ON playlists_songs_activities.song_id = songs.id
      WHERE playlists_songs_activities.playlist_id = $1
      GROUP BY users.username, songs.title, playlists_songs_activities.action, playlists_songs_activities.time
      ORDER BY playlists_songs_activities.time ASC`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Id playlist tidak ditemukan');
    }

    return result.rows;
  }
}

module.exports = PlaylistsSongsActivitiesService;
