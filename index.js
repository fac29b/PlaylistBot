//Create a Discord Bot using OpenAI API to interact on a Discord server
require('dotenv').config();
//Array to store ongoing user conversation
let conversation = [];

// Prepare to connect to the Dicsord API
const {Client, GatewayIntentBits} = require('discord.js');
const client = new Client({intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
]})


const { OpenAI} = require('openai');
const openai = new OpenAI({
    apiKey:process.env.OPENAI_KEY
})
// Check for when a message on discord is sent
client.on('messageCreate', async function(message){
    try {
        // checks if message is from the bot and "ignores" if true
        if(message.author.bot) return;
        conversation.push(message.content)
        // code for implementing ChatGPT response
        const gptResponse = await openai.completions.create({
            model: "text-davinci-003",
            prompt: `ChatGPT is a friendly chatbot. When answering questions ChatGPT must do so 
            in the manner of a wandering monk from the 8th century\n\
            format your answers as a JSON object with the keys title, artist, genre \n\
            if the message does not relate to music prompt for such a question \n\
        ChatGPT: Hello, how are you?\n\
        ${message.author.username}: ${conversation.toString()}\n\
        ChatGPT:`,
            temperature: 0.5,
            max_tokens: 1000,
            stop: ["ChatGPT:"],
        })
        // taking the response from GPT and passing to the chatbot
        
        message.reply(`${gptResponse.choices[0].text}`);
        conversation.push(gptResponse.choices[0].text);
        console.log(conversation);

    } catch(err) {
        console.log(err)
    }
});

// log the bot into the discord server
client.login(process.env.DISCORD_TOKEN);
console.log('chatbot is online on discord');