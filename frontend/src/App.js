import React, { 
  useEffect 
} from 'react';
import {
  useLocation
} from "react-router-dom";
import Button from 'react-bootstrap/Button'
import logo from './logo.svg';
import './css/App.css';

export default function App() {
  return (
    <div>
      <SpotifyAuthorizationTest />
    </div>
  )
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SpotifyAuthorizationTest() {
  
  var query = useQuery();
  var recentlyPlayed = 'http://localhost:9000/recently-played';
  var beginAuthorize = 'http://localhost:9000/spotify-authorize';
  var completeAuthorize = 'http://localhost:9000/spotify-access-token';
  var afterAuthorize = 'http://localhost:3000/';

  useEffect(() => {
    if(query.has('code')) {
      let postBody = {
        'redirectURL': afterAuthorize,
        'access_token': query.get('code'),
      };

      fetch(completeAuthorize, { 
        'method': 'POST', 
        'headers': {
          'Content-Type': 'application/json'
        },
        'redirect': 'follow',
        'body': JSON.stringify(postBody)
      })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
  }, [query, completeAuthorize, afterAuthorize])

  const handleAuthorizeClick = () => {

    fetch(beginAuthorize, { method: 'POST' })
      .then(response => response.json())
      .then(data => {
        if(data.spotifyURL) {
          // I very much dislike doing this. It feels wrong
          // But at the moment I can't seem to find another way
          window.location.href = data.spotifyURL;
        } 
      })
      .catch((err) => {
        console.log(err + " url: " + beginAuthorize);
      })

  }

  const handleRecentlyPlayedClick = () => {
    fetch(recentlyPlayed)
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch((err) => {
        console.log('There was an error fetching recently played: ' + err);
      })
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Button style={{backgroundColor: "#61dafb"}} size="lg" onClick={handleAuthorizeClick}>
          Sign Into Spotify
        </Button>
        <Button style={{backgroundColor: '#61dafb'}} size='lg' onClick={handleRecentlyPlayedClick}>
          Fetch Recently Played
        </Button>
      </header>
    </div>
  );
};
