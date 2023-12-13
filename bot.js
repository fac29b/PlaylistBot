import 'dotenv/config';
// Will give us access to all the .env variables

import { Client } from 'discord.js';
import { OpenAI } from 'openai';
import axios from 'axios';
// the axios library in Node.js to make HTTP requests

let address = '';
let songSuggestion = {};
const clientId = 'b9187564d05d46e891a197b24dc20983';
const clientSecret = process.env.SPOTKEY;
const trackId = '6NPVjNh8Jhru9xOmyQigds';
const playlistId = '3cKZDGGHg6r9pAiwIOXGpZ';

const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent']
});

client.on('ready', () => {
    console.log('The bot is alive!');
});

const IGNORE_PREFIX = '!';
const CHANNELS = ['1182322735817441320']
// bots channel only for now - can add any channel ID here as needed in the future

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
})

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content.startsWith(IGNORE_PREFIX)) return;
    if (!CHANNELS.includes(message.channelId) && !message.mentions.users.has(client.user.id)) 
        return;

    await message.channel.sendTyping();

    const sendTypingInterval = setInterval(() => {
        message.channel.sendTyping();
    }, 5000);

    let conversation = [];

    conversation.push({
        role: 'system',
        content: 'Chat GPT is a friendly chatbot.',
    })

    let prevMessages = await message.channel.messages.fetch({limit: 10 });
    prevMessages.reverse();

    prevMessages.forEach((msg) => {
        if (msg.author.bot && msg.author.id !== client.user.id) return;
        // If author was a bot and not this bot message will be ignored

        if (msg.content.startsWith(IGNORE_PREFIX)) return;

        const username = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');

        if (msg.author.id === client.user.id) {
            conversation.push({
                role: 'assistant',
                name: username,
                content: msg.content,
            });

            return;
        }

        conversation.push({
            role: 'user',
            name: username,
            content: msg.content,
        });
    })
    
    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: conversation,
        // prompt: 'format your answers as a JSON object with the keys title, artist, genre. format the link as a json object and separate the track ID number, which comes at the end of the url after track, into its own key data pair'

    })
    .catch((error) => console.error('OpenAI Error:\n', error));

    clearInterval(sendTypingInterval);

    if (!response) {
        message.reply("I'm having some trouble with the OpenAI API. Try again in a moment.");
        return;
    }

    const responseMessage = response.choices[0].message.content;
    songSuggestion.test = response.choices[0].message.content;
    console.log('fintan testing', songSuggestion.test)
    // addTrackToPlaylist();
    const chunkSizeLimit = 2000;

    for (let i = 0; i < responseMessage.length; i += chunkSizeLimit) {
        const chunk = responseMessage.substring(i, i + chunkSizeLimit);

        await message.reply(chunk);
    }
});

client.login(process.env.TOKEN);


/////////////////
// SPOTIFY APP ACCESS
/////////////////

import express from 'express';
import querystring from 'querystring';
// import axios from 'axios';
import { DateTime } from 'luxon';
// import 'dotenv/config';

const app = express();
app.use(express.json());

const CLIENT_ID = '2c52abffbc8742d2b5441acdc4aec18d';
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:8888/callback';

const AUTH_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE_URL = 'https://api.spotify.com/v1/';

let session = {};

app.get('/', (req, res) => {
  res.send("Welcome to the Spotify app <a href='/login'>Login</a>");
});

app.get('/login', (req, res) => {
  const scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private';

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
      // console.log('Token Info:', tokenInfo);
      // console.log('Session after token retrieval:', session);

      return res.redirect('/playlists');
    } catch (error) {
      return res.status(500).json({ error: 'Failed to retrieve tokens' });
    }
  }
});

app.get('/playlists', async (req, res) => {
  // console.log('Session before accessing playlists:', session);
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


// ADDING SONG TO PLAYLIST
const addTrackToPlaylist = async () => {
  try {
    const headers = {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };

    const requestBody = {
      uris: [`spotify:track:${trackId}`], // Assuming track ID is specified like this
    };

    const response = await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      requestBody,
      { headers }
    );

    console.log('Track added to playlist:', response.data);
  } catch (error) {

    console.error('Failed to add track to playlist:', error.response.data);
  }
};
