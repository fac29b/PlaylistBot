import 'dotenv/config';
// Will give us access to all the .env variables
import axios from 'axios';
// the axios library in Node.js to make HTTP requests

// Spotify client info
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTKEY;

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
import SpotifyWebAPI from 'spotify-web-api-node';
const spotifyApi = new SpotifyWebAPI({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: 'http://localhost:3000/',
});

// To get the access tokens to spotify API
const getToken = async () => {
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', null, {
        params: {
          grant_type: 'client_credentials',
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: clientId,
          password: clientSecret,
        },
      });
  
      const { access_token, token_type, expires_in } = response.data;
      console.log('Access Token:', access_token);
      console.log('Token Type:', token_type);
      console.log('Expires In:', expires_in);
  
      // Use the access token for making authenticated requests to the Spotify API
      // ...
  
    } catch (error) {
      console.error('Error obtaining access token:', error.message);
    }
  };
  
  // Call the function to obtain the access token
  getToken();

// Replace the following line with the actual access token you obtained
const accessToken = 'BQDJt8C5m5vTKHHs9AZE1bn-HeZgC9F_DEe_PHHbH6Au2_1wCaAbCdJQTbUvFryeCFVmebAbcK_IH9GbJBkzlqoLsVMTsJyuOB0Yozz9kiuKw3BrdMo';

// Set the access token in the Spotify API object
spotifyApi.setAccessToken(accessToken);

// Code to check connection to spotify API by console logging an Elvis album info:
spotifyApi.getAlbum('6oWz2hJ89n9mKarg3SO9ou').then(
    function(data) {
      console.log('Artist albums', data.body);
    },
    function(err) {
      console.error(err);
    }
  );

// Start of Chatbot Code
client.on('messageCreate', async (message) => {
    console.log(`Client heard message and should show content here: ${message.content}`);
    if (message.content.startsWith("!play")) {
        console.log("!play happened")


        var songname = message.content.replace('!play ', '');
        console.log(`Song name: ${songname}`);

        // Trying this code with an await (old conde currently below)
        try {
            const data = await spotifyApi.searchArtists(songname);
            console.log(`Search artists by ${songname}`, data.body);
        } catch (error) {
            console.error('Error searching artists:', error);
        }

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

