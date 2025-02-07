const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const autoBind = require('auto-bind');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const ClientError = require('../exceptions/ClientError');

class UsersAlbumsLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;

    autoBind(this);
  }

  async verifyAlbumExistence(albumId) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  async verifyUserLikeOnAlbum({ userId, albumId }) {
    const query = {
      text: 'SELECT * FROM users_albums_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (result.rows.length) {
      throw new ClientError('Pengguna telah menyukai album');
    }
  }

  async addAlbumLikeFromUser({ userId, albumId }) {
    const id = `user_album_likes-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO users_albums_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]?.id) {
      throw new InvariantError('Like pada album gagal ditambahkan');
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getAmountOfAlbumLikesById(albumId, setCacheStatus) {
    try {
      const result = await this._cacheService.get(`likes:${albumId}`);
      setCacheStatus(true);

      return JSON.parse(result);
    } catch {
      setCacheStatus(false);

      const query = {
        text: 'SELECT COALESCE(COUNT(user_id), 0) AS likes FROM users_albums_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);

      await this._cacheService.set(`likes:${albumId}`, JSON.stringify(result.rows[0]));

      return result.rows[0];
    }
  }

  async deleteAlbumLikeFromUser({ userId, albumId }) {
    const query = {
      text: 'DELETE FROM users_albums_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Like pada album gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }
}

module.exports = UsersAlbumsLikesService;
