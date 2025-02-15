const autoBind = require('auto-bind');

class UploadsHandler {
  constructor(service, validator, albumsService) {
    this._service = service;
    this._validator = validator;
    this._albumsService = albumsService;

    autoBind(this);
  }

  async postUploadImageHandler(request, h) {
    const { cover } = request.payload;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const { id: albumId } = request.params;

    const filename = await this._service.writeFile(cover, cover.hapi);

    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    await this._albumsService.addAlbumCover({ albumId, coverUrl });

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
