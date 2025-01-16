const autoBind = require('auto-bind');

class PlaylistsSongsActivitiesHandler {
  constructor(activitiesService, playlistsService) {
    this._activitiesService = activitiesService;
    this._playlistsService = playlistsService;

    autoBind(this);
  }

  async getActivitiesOfPlaylist(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const activities = await this._activitiesService.getPlaylistSongActivities(playlistId);
    return {
      status: 'success',
      data: { playlistId, activities },
    };
  }
}

module.exports = PlaylistsSongsActivitiesHandler;
