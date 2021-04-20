require('dotenv').config()

const express = require('express')
const SpotifyWebApi = require('spotify-web-api-node')
const spotifyMappers = require('./mappers/mapSpotifyData')

const app = express()
const port = 9000

const jsonParser = express.json()

const cookieParser = require('cookie-parser')
app.use(cookieParser())
const cors = require('cors')
app.use(cors({
  origin: 'http://localhost:3000', // TODO: Will probably need to be changed for production
  credentials: true
}))

const scopes = [
  'user-read-private',
  'user-read-email',
  'user-read-recently-played',
  'user-read-currently-playing'
]
const redirectUri = 'http://localhost:3000/'
const clientId = process.env.SPOTIFY_API_CLIENT_ID
const secretId = process.env.SPOTIFY_API_SECRET_ID
const state = 'spotify_auth_state'
const showDialog = true
const responseType = 'code'

const spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
  clientId: clientId,
  clientSecret: secretId,
  market: 'US' // This will need to be updated at some point but should work for now
})

// Allows multiple users to be authenticated at the same time
// Might lead to security hole?? But I don't think its any better
// security wise than what was happening with just a single access
// token
// This link gives the proper structure for doing this:
// https://stackoverflow.com/questions/33860262/how-to-interact-with-back-end-after-successful-auth-with-oauth-on-front-end
const accessTokens = {} // Contains random string associated with this server that is mapped to a spotify access code

/** Functions for managing access tokens **/

function addAccessToken (accessToken, refreshToken) {
  const cookieString = generateRandomString(16)

  accessTokens[cookieString] = {
    access_token: accessToken,
    refreshToken: refreshToken
  }

  return cookieString
}

function checkAndSetAccessToken (cookieString) {
  if (accessTokens[cookieString]) {
    spotifyApi.setAccessToken(accessTokens[cookieString].access_token)
    spotifyApi.setRefreshToken(accessTokens[cookieString].refresh_token)

    return true
  }
  return false
}

function generateRandomString (length) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
};

/** Hello world! home page **/

app.get('/', (req, res) => {
  res.send('Hello world!')
})

/** Functions for authorizing the API with the users spotify account **/

// Sends the authorization URL to the frontend
app.post('/spotify-authorize', (req, res) => {
  const authorizeURL = spotifyApi.createAuthorizeURL(
    scopes,
    state,
    showDialog,
    responseType
  )

  res.send({ spotifyURL: authorizeURL })
})

// Gets the authorization token and adds it to the API instance
// TODO: Currently the refresh token is not being used
app.post('/spotify-access-token/', jsonParser, (req, res) => {
  spotifyApi.authorizationCodeGrant(req.body.access_token)
    .then((data) => {
      const cookieString = addAccessToken(data.body.access_token, data.body.refresh_token)

      res.cookie(state, cookieString, {
        httpOnly: false,
        secure: false
      }) // TODO: Believe these two options should be changed in produciton

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

/** Functions on a User to User basis */

// Get Recently Played tracks
// (will probably be removed eventually, unless it continues to serve as a handy test function)
app.get('/recently-played', (req, res) => {
  if (checkAndSetAccessToken(req.cookies.spotify_auth_state)) {
    spotifyApi.getMyRecentlyPlayedTracks({
      limit: 20
    })
      .then((data) => res.send(data.body))
      .catch((err) => {
        console.log('Something went wrong!', err)
        res.send(err)
      })
  } else {
    res.send('You are not authorized')
  }
})

// Track that is currently playing for this account (no info for where it's playing)
app.get('/currently-playing', (req, res) => {
  if (checkAndSetAccessToken(req.cookies.spotify_auth_state)) {
    spotifyApi.getMyCurrentPlayingTrack()
      .then((data) => res.send(
        spotifyMappers.mapMyCurrentlyPlayingTrack(data.body)))
      .catch((err) => {
        console.log('Something went wrong!', err)
        res.send(err)
      })
  } else {
    res.send('You are not authorized')
  }
})
// Gets an album given album IDs TODO: Make the album IDs a URL parameter
// Hardcoded Album IDs:
// 2Ek1q2haOnxVqhvVKqMvJe
// 2ix8vWvvSp2Yo7rKMiWpkg
// Note: Once dynamodb is setup this will no longer be necessary and a url
// parameter should be added
app.get('/album', (req, res) => {
  if (checkAndSetAccessToken(req.cookies.spotify_auth_state)) {
    spotifyApi.getAlbum('2Ek1q2haOnxVqhvVKqMvJe')
      .then((data) => res.send(
        spotifyMappers.mapGetAlbum(data.body)))
      .catch((err) => {
        console.log('Something went wrong!', err)
        res.send(err)
      })
  } else {
    res.send('You are not authorized')
  }
})

// Query parameters:
// q - keyword to be plugged into spotify search (spaces should be encoded as %20)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
