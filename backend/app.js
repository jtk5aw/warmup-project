require('dotenv').config()

const express = require('express')
const SpotifyWebApi = require('spotify-web-api-node')
const spotifyMappers = require('./mappers/mapSpotifyData')

const app = express()
const port = 9000

const jsonParser = express.json()

const cors = require('cors')
app.use(cors())

const scopes = [
  'user-read-private',
  'user-read-email',
  'user-read-recently-played',
  'user-read-currently-playing'
]
const redirectUri = 'http://localhost:3000/'
const clientId = process.env.SPOTIFY_API_CLIENT_ID
const secretId = process.env.SPOTIFY_API_SECRET_ID
const state = 'some-state-of-my-choice'
const showDialog = true
const responseType = 'code'

const spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
  clientId: clientId,
  clientSecret: secretId,
  market: 'US' // This will need to be updated at some point but should work for now
})

app.get('/', (req, res) => {
  res.send('Hello world!')
})

app.post('/spotify-authorize', (req, res) => {
  const authorizeURL = spotifyApi.createAuthorizeURL(
    scopes,
    state,
    showDialog,
    responseType
  )

  res.send({ spotifyURL: authorizeURL })
})

app.post('/spotify-access-token/', jsonParser, (req, res) => {
  spotifyApi.authorizationCodeGrant(req.body.access_token)
    .then((data) => {
      spotifyApi.setAccessToken(data.body.access_token)
      spotifyApi.setRefreshToken(data.body.refresh_token)

      spotifyApi.getMe()
        .then((data) => res.send(
          spotifyMappers.mapGetMe(data.body)))
        .catch((err) => {
          console.log('Something went wrong!', err)
          res.send(err)
        })
    },
    (err) => {
      console.log(err, req)
    })
})

app.get('/recently-played', (req, res) => {
  spotifyApi.getMyRecentlyPlayedTracks({
    limit: 20
  })
    .then((data) => res.send(data.body))
    .catch((err) => {
      console.log('Something went wrong!', err)
      res.send(err)
    })
})

app.get('/currently-playing', (req, res) => {
  spotifyApi.getMyCurrentPlayingTrack()
    .then((data) => res.send(
      spotifyMappers.mapMyCurrentlyPlayingTrack(data.body)))
    .catch((err) => {
      console.log('Something went wrong!', err)
      res.send(err)
    })
})

// Hardcoded Album IDs:
// 2Ek1q2haOnxVqhvVKqMvJe
// 2ix8vWvvSp2Yo7rKMiWpkg
// Note: Once dynamodb is setup this will no longer be necessary and a url
// parameter should be added
app.get('/album', (req, res) => {
  spotifyApi.getAlbum('2Ek1q2haOnxVqhvVKqMvJe')
    .then((data) => res.send(
      spotifyMappers.mapGetAlbum(data.body)))
    .catch((err) => {
      console.log('Something went wrong!', err)
      res.send(err)
    })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
