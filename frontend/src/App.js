import React, { 
  useEffect, 
  useState,
} from 'react';
import {
  useLocation,
  useHistory,
} from "react-router-dom";
import {
  Image,
  Button,
  Container,
  Row,
} from 'react-bootstrap'
import logo from './logo.svg';
import './css/App.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function App() {
  
  // State
  let query = useQuery();
  let history = useHistory();
  let [displayName, setDisplayName] = useState(null);

  // Server URLs to use
  let recentlyPlayed = 'http://localhost:9000/recently-played';
  let currentlyPlaying = 'http://localhost:9000/currently-playing';
  let getAlbum = 'http://localhost:9000/album';
  let beginAuthorize = 'http://localhost:9000/spotify-authorize';
  let completeAuthorize = 'http://localhost:9000/spotify-access-token';

  // Browser URLs to use
  let afterAuthorize = 'http://localhost:3000/';

  // State functions

  useEffect(() => {
    if(query.has('code') && displayName === null) {
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
          console.log(data);
          setDisplayName(data['display_name']);
          history.push('/');
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  }, [query, displayName, history, completeAuthorize, afterAuthorize]);

  // Other functions

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

  // Note: These aren't being consolidated because they will not be here forever
  // This is not permanent functionality

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

  const handleCurrentlyPlayingClick = () => {
    fetch(currentlyPlaying) 
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch((err) => {
        console.log('There was an error fetching recently played: ' + err);
      })
  }

  const handleGetAlbumClick = () => {
    fetch(getAlbum)
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch((err) => {
        console.log('There was an error fetchign recently played: ' + err);
      })
  }

  return (
    <Container className="App" fluid>
      <Row className="App-header">
        <Image src={logo} className="App-logo m-2" alt="logo" />
        {displayName 
        ? 
        <Container>
          <Button className="m-2" style={{backgroundColor: '#61dafb'}} size='lg' onClick={handleRecentlyPlayedClick}>
            Fetch Recently Played
          </Button>
          <Button className="m-2" style={{backgroundColor: '#61dafb'}} size='lg' onClick={handleCurrentlyPlayingClick}>
            Fetch Currently Playing
          </Button>
          <Button className="m-2" style={{backgroundColor: '#61dafb'}} size='lg' onClick={handleGetAlbumClick}>
            Get Album
          </Button>
        </Container>
        :
        <Button className="m-2" style={{backgroundColor: "#61dafb"}} size="lg" onClick={handleAuthorizeClick}>
          Sign Into Spotify
        </Button> 
        }
      </Row>
    </Container>
  );
};
