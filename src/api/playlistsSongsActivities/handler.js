const autoBind = require('auto-bind');

class PlaylistsSongsActivitiesHandler {
  constructor(activitiesService, playlistsService) {
    this._activitiesService = activitiesService;
    this._playlistsService = playlistsService;

    autoBind(this);
  }

  async getActivitiesOfPlaylist(request) {
    const { id: playlistId } = request.param;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const activities = await this._activitiesService.getplaylistSongActivities(playlistId);
    return {
      status: 'success',
      data: { playlistId, activities },
    };
  }
}

module.exports = PlaylistsSongsActivitiesHandler;
