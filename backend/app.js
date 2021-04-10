require('dotenv').config();

const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const port = 9000;

const jsonParser = express.json();


const cors = require('cors');
app.use(cors());

var scopes = ['user-read-private', 'user-read-email', 'user-read-recently-played'],
    redirectUri = 'http://localhost:3000/',
    clientId = process.env.SPOTIFY_API_CLIENT_ID,
    secretId = process.env.SPOTIFY_API_SECRET_ID,
    state = 'some-state-of-my-choice',
    showDialog = true,
    responseType = 'code';

var spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId,
    clientSecret: secretId
});

app.get('/', (req, res) => {
    res.send('Hello world!');
});

app.post('/spotify-authorize', (req, res) => {
    var authorizeURL = spotifyApi.createAuthorizeURL(
        scopes,
        state,
        showDialog,
        responseType
    );

    res.send({spotifyURL: authorizeURL});
    
});

app.post('/spotify-access-token/', jsonParser, (req, res) => {

    spotifyApi.authorizationCodeGrant(req.body.access_token)
        .then((data) => {
            spotifyApi.setAccessToken(data.body['access_token'])
            spotifyApi.setRefreshToken(data.body['refresh_token']);

            // For now sends nothing back but need to make it send email to verify login
        }, 
        (err) => {
            console.log('Something.went wrong!', err);
        });

});

app.get('/recently-played', (req, res) => {
    spotifyApi.getMyRecentlyPlayedTracks({
        limit: 20
    }).then((data) => {
        res.send(data.body);
    }).catch((err) => {
        console.log('Something went wrong!', err);
        res.send(err);
    })
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});