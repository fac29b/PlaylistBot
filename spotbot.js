import 'dotenv/config';
// Will give us access to all the .env variables
 import axios from 'axios';
// the axios library in Node.js to make HTTP requests

let address = '';
let songSuggestion = {};
const clientId = 'b9187564d05d46e891a197b24dc20983';
const clientSecret = process.env.SPOTKEY;
const trackId = '3nlGByvetDcS1uomAoiBmy';
const playlistId = '3cKZDGGHg6r9pAiwIOXGpZ';
import { Client } from 'discord.js';

const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent']
});

client.on('ready', () => {
    console.log('The bot is alive!');
});

const CHANNELS = ['1182322735817441320']
// bots channel only for now - can add any channel ID here as needed in the future

/////////
// Spotify chatbot code:
////////
// import SpotifyWebAPI from 'spotify-web-api-node';
// const spotifyApi = new SpotifyWebAPI({
//   clientId: clientId,
//   clientSecret: clientSecret,
//   redirectUri: 'http://localhost:3000/',
// });

// 
// Start of Chatbot Code
// ///
client.on('messageCreate', async (message) => {
    console.log(`Client heard message and should show content here: ${message.content}`);
    if (message.content.startsWith("!play")) {
      // addTrackToPlaylist();
        // console.log("!play happened")
        // console.log('the address is a success!', address)


        var songname = message.content.replace('!play ', '');
        console.log(`Song name: ${songname}`);

        // spotifyApi.searchArtists(songname)
        //     .then(function(data) {
        //         console.log(`Search artists by ${songname}`, data.body);
        //     }, function(err) {
        //         console.error(err);
        //     });

        // spotify.search({ type: 'track', query: songname, limit: 1 }, function(err, data) {
        //     console.log('Spotify API data:', data);
        //   if (err) {
        //     return message.channel.send('An error occurred: ' + err);
        //   }
        
        //   Log the track details
        //   let track = data.tracks.items[0];
        //   let trackDetails = `Track: ${track.name} \nArtist(s): ${track.artists.map(artist => artist.name).join(', ')} \nAlbum: ${track.album.name} \nListen on Spotify: ${track.external_urls.spotify}`;
          
        //   message.channel.send(trackDetails);
        // });
    }
    // if (error) {
    //     console.error('Spotify API error:', err);
    //     return message.channel.send('An error occurred while searching for the track.');
    //   }
    // .catch((error) => console.error('Spotify Error:\n', error));
      
});

client.login(process.env.TOKEN);

/////////
// OpenAI code set up code:
/////////
// const { OpenAI } = require('openai');
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_KEY,
// })
// const IGNORE_PREFIX = '!';

/////////
// Chat GPT-4 chatbot code:
/////////
// client.on('messageCreate', async (message) => {
//     if (message.author.bot) return;
//     if (message.content.startsWith(IGNORE_PREFIX)) return;
//     if (!CHANNELS.includes(message.channelId) && !message.mentions.users.has(client.user.id)) 
//         return;

//     await message.channel.sendTyping();

//     const sendTypingInterval = setInterval(() => {
//         message.channel.sendTyping();
//     }, 5000);

//     let conversation = [];

//     conversation.push({
//         role: 'system',
//         content: 'Chat GPT is a friendly chatbot.'
//     })

//     let prevMessages = await message.channel.messages.fetch({limit: 10 });
//     prevMessages.reverse();

    // prevMessages.forEach((msg) => {
    //     if (msg.author.bot && msg.author.id !== client.user.id) return;
    //     // If author was a bot and not this bot message will be ignored

    //     if (msg.content.startsWith(IGNORE_PREFIX)) return;

    //     const username = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');

    //     if (msg.author.id === client.user.id) {
    //         conversation.push({
    //             role: 'assistant',
    //             name: username,
    //             content: msg.content,
    //         });

    //         return;
    //     }

    //     conversation.push({
    //         role: 'user',
    //         name: username,
    //         content: msg.content,
    //     });
    // })
    
    // const response = await openai.chat.completions.create({
    //     model: 'gpt-4',
    //     messages: conversation,
    // })
    // .catch((error) => console.error('OpenAI Error:\n', error));

//     clearInterval(sendTypingInterval);

//     if (!response) {
//         message.reply("I'm having some trouble with the OpenAI API. Try again in a moment.");
//         return;
//     }

//     const responseMessage = response.choices[0].message.content;
//     const chunkSizeLimit = 2000;

//     for (let i = 0; i < responseMessage.length; i += chunkSizeLimit) {
//         const chunk = responseMessage.substring(i, i + chunkSizeLimit);

//         await message.reply(chunk);
//     }
// });

// client.login(process.env.TOKEN);

// SPOTIFY APP ACCESS


import express from 'express';
import querystring from 'querystring';
// import axios from 'axios';
import { DateTime } from 'luxon';
import 'dotenv/config';

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


// export const testing = 'the test has passed';
// export function test() {
//     console.log('test passed', testing);
// }

/////
// OLD SPOTIFY APP CODE
/////
// To get the access tokens to spotify API
// const getToken = async () => {
//     try {
//       const response = await axios.post('https://accounts.spotify.com/api/token', null, {
//         params: {
//           grant_type: 'client_credentials',
//         },
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         auth: {
//           username: clientId,
//           password: clientSecret,
//         },
//       });
  
//       const { access_token, token_type, expires_in } = response.data;
//       console.log('Access Token:', access_token);
//       console.log('Token Type:', token_type);
//       console.log('Expires In:', expires_in);
  
//       // Use the access token for making authenticated requests to the Spotify API
//       // ...
  
//     } catch (error) {
//       console.error('Error obtaining access token:', error.message);
//     }
//   };
  
//   // Call the function to obtain the access token
//   getToken();

// // Replace the following line with the actual access token you obtained
// const accessToken = 'BQC4umkgtUxIB4Y5jy_wIF6xbtV4IZA2S4rhEy5qLZN7Tnwm77uCleWYF5N7V_TTHDLMCYQkdw-8kwxB2Bibkby_hBIRFBEiWa18fmfjXjejKZKwW50';

// // Set the access token in the Spotify API object
// spotifyApi.setAccessToken(accessToken);

// // Code to check connection to spotify API by console logging an Elvis album info:
// spotifyApi.getAlbum('6oWz2hJ89n9mKarg3SO9ou').then(
//     function(data) {
//       console.log('Artist albums', data.body);
//     },
//     function(err) {
//       console.error(err);
//     }
//   );

