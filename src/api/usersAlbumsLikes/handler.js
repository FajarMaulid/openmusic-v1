const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service) {
    this._service = service;

    autoBind(this);
  }

  async postUserLikeOnAlbumHandler(request, h) {
    const { albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.verifyAlbumExistence(albumId);
    await this._service.verifyUserLikeOnAlbum({ userId, albumId });

    await this._service.addAlbumLikeFromUser({ userId, albumId });

    const response = h.response({
      status: 'success',
      message: 'Like berhasil diberikan pada album',
    });
    response.code(201);
    return response;
  }

  async getAmountOfAlbumLikesHandler(request, h) {
    const { albumId } = request.params;

    let isFromCache = false;

    const likes = await this._service.getAmountOfAlbumLikesById(albumId, (fromCache) => {
      isFromCache = fromCache;
    });

    const response = h.response({
      status: 'success',
      data: {
        likes: parseInt(likes.likes, 10),
      },
    });

    if (isFromCache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async deleteUserLikeOnAlbumHandler(request) {
    const { albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.deleteAlbumLikeFromUser({ userId, albumId });

    return {
      status: 'success',
      message: 'like pada album berhasil dihapus',
    };
  }
}

module.exports = PlaylistsHandler;
