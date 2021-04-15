
module.exports = {
  mapSpotifyGetMe: function (data) {
    return {
      display_name: data.body.display_name
    }
  }
}
