
module.exports = {
  mapGetMe: function (json) {
    return {
      display_name: json.display_name
    }
  },
  mapMyCurrentlyPlayingTrack: function (json) {
    return {
      is_playing: json.is_playing,
      track_name: json.item.name,
      artists: getArtists(json.item.artists),
      is_album: json.item.album.album_type === 'album',
      album_name: json.item.album.name,
      art_link: json.item.album.images[2], // Linking the smallest one for now
      track_number: json.item.track_number,
      current_progress_ms: json.progress_ms,
      total_ms: json.item.duration_ms
    }
  },
  mapGetAlbum: function (json) {
    return {
      is_album: json.album_type === 'album',
      album_name: json.name,
      copyrights: json.copyrights,
      artists: getArtists(json.artists),
      art_link: json.images[2], // Linking the smallest one for now
      release_date: json.release_date,
      release_date_precision: json.release_date_precision,
      num_tracks: json.tracks.total, // This only works if the track count < 50
      tracks: getTracks(json.tracks.items)
    }
  }
}

function getArtists (artists) {
  return artists.map((val) => val.name)
}

// Note: For longer albums (it looks like the default is longer than 50)
// you have to make another request. For now that's being ignored but might
// need to add this functionality in the future.
function getTracks (tracks) {
  return tracks.map((val) => {
    return {
      artists: getArtists(val.artists),
      track_name: val.name,
      track_number: val.track_number,
      disc_number: val.disc_number,
      total_ms: val.duration_ms
    }
  })
}
