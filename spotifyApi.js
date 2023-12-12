const express = require('express');
const querystring = require('querystring');
const axios = require('axios');
const { DateTime } = require('luxon');

const app = express();
app.use(express.json());

const CLIENT_ID = '2c52abffbc8742d2b5441acdc4aec18d';
const CLIENT_SECRET = 'f874e5cdb5c44a6ea0994487fce28d13';
const REDIRECT_URI = 'http://localhost:8888/callback';

const AUTH_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE_URL = 'https://api.spotify.com/v1/';

let session = {};
let address = '';

app.get('/', (req, res) => {
  res.send("Welcome to the Spotify app <a href='/login'>Login</a>");
});

app.get('/login', (req, res) => {
  const scope = 'user-read-private user-read-email';

  const params = {
    client_id: CLIENT_ID,
    response_type: 'code',
    scope: scope,
    redirect_uri: REDIRECT_URI,
    show_dialog: true,
  };

  const authUrl = `${AUTH_URL}?${querystring.stringify(params)}`;

  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  if ('error' in req.query) {
    return res.json({ error: req.query.error });
  }

  if ('code' in req.query) {
    const reqBody = {
      code: req.query.code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    };

    try {
      const response = await axios.post(TOKEN_URL, querystring.stringify(reqBody), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const tokenInfo = response.data;


      // Store token information in session
      session.access_token = tokenInfo.access_token;
      session.refresh_token = tokenInfo.refresh_token;
      session.expires_at = DateTime.now().toSeconds() + tokenInfo.expires_in;

      // Log the token information and session after retrieval
      console.log('Token Info:', tokenInfo);
      console.log('Session after token retrieval:', session);

      return res.redirect('/playlists');
    } catch (error) {
      return res.status(500).json({ error: 'Failed to retrieve tokens' });
    }
  }
});

app.get('/playlists', async (req, res) => {
  console.log('Session before accessing playlists:', session);
  if (!session.access_token) {
    return res.redirect('/login');
  }

  if (DateTime.now().toSeconds() > session.expires_at) {
    return res.redirect('/refresh-token');
  }

  try {
    const headers = {
      Authorization: `Bearer ${session.access_token}`,
    };

    const response = await axios.get(`${API_BASE_URL}me/playlists`, { headers });
    const playlists = response.data;
    address = playlists.items[0].href;
    console.log('testing address', address)
    return res.json(`<a href="${playlists.items[0].href}">playlist</a>`);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

app.get('/refresh-token', async (req, res) => {
  if (!session.refresh_token) {
    return res.redirect('/login');
  }

  if (DateTime.now().toSeconds() > session.expires_at) {
    const reqBody = {
      grant_type: 'refresh_token',
      refresh_token: session.refresh_token,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    };

    try {
      const response = await axios.post(TOKEN_URL, querystring.stringify(reqBody), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const newTokenInfo = response.data;

      session.access_token = newTokenInfo.access_token;
      session.expires_at = DateTime.now().toSeconds() + newTokenInfo.expires_in;

      return res.redirect('/playlists');
    } catch (error) {
      return res.status(500).json({ error: 'Failed to refresh token' });
    }
  }
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

