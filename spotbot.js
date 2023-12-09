require('dotenv/config');
// Will give us access to all the .env variables

const { Client } = require('discord.js');
const { OpenAI } = require('openai');

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


/////////
// Spotify Code:
////////
const Spotify = require('spotify-web-api-node');
const spotify = new Spotify({
  clientId: 'de9e50d0184a457c833586593572744a',
  clientSecret: process.env.SPOTKEY,
  redirectUri: 'http://localhost:3000/',
});

client.on('messageCreate', async (message) => {
    console.log(`Client heard message and should show content here: ${message.content}`);
    if (message.content.startsWith("!play")) {
        console.log("!play happened")


        var songname = message.content.replace('!play ', '');
        console.log(`Song name: ${songname}`);

        spotify.search({ type: 'track', query: songname, limit: 1 }, function(err, data) {
            console.log('Spotify API data:', data);
        //   if (err) {
        //     return message.channel.send('An error occurred: ' + err);
        //   }
        
        //   Log the track details
        //   let track = data.tracks.items[0];
        //   let trackDetails = `Track: ${track.name} \nArtist(s): ${track.artists.map(artist => artist.name).join(', ')} \nAlbum: ${track.album.name} \nListen on Spotify: ${track.external_urls.spotify}`;
          
        //   message.channel.send(trackDetails);
        });
    }
    // if (error) {
    //     console.error('Spotify API error:', err);
    //     return message.channel.send('An error occurred while searching for the track.');
    //   }
    // .catch((error) => console.error('Spotify Error:\n', error));
      
});

client.login(process.env.TOKEN);


/////////
// Chat GPT-4 code:
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

