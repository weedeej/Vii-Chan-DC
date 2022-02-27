// Init environment variables
import dotenv from 'dotenv';
dotenv.config();
// Require the necessary discord.js classes
import { Client, Intents } from 'discord.js';
import { CreateEmbed } from './Utilities/EmbedGenerator.js';

import { ObtainSkinlist } from './Utilities/SkinsListFetch.js'
// Commands
import { daily } from './Commands/daily.js';
import { watch, watch_button_action } from './Commands/watch.js';;
// Logger
import { Logger } from './Utilities/Logger.js';
// Client Instance
const token = process.env.DISCORD_BOT_TOKEN;
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
let skinslist = {};
// When the client is ready, run this code (only once)
client.once('ready', async () => {
    // Get Skinlist
    Logger.info('Getting Skinlist...');
    skinslist = await ObtainSkinlist();
    if (skinslist.riotClientVersion === undefined) {
        Logger.error('Could not get skinlist.' + skinslist);
        return;
    }
    Logger.info(`Skinlist Obtained : ${skinslist.riotClientVersion}`);
    Logger.info('Commands are registered and is ready to go.');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand())
    {
        await interaction.deferReply(); // Defer the reply until we're ready
        const { commandName } = interaction;
        const params = interaction.options;
        switch(commandName)
        {
            case "dailybeta":
                return await daily(interaction);
            case "watchbeta":
                return await watch(interaction, params, skinslist);
            case "waitlistbeta":// This is next
                return await interaction.editReply(CreateEmbed({title:"Test Embed", description:"This is a test embed"}));
            case "unwatchbeta":
                return await interaction.editReply(CreateEmbed({title:"Test Embed", description:"This is a test embed"}));
            case "totalspentbeta":
                return await interaction.editReply(CreateEmbed({title:"Test Embed", description:"This is a test embed"}));
        }
        return;
    }
});


// Login to Discord with your client's token
client.login(token);