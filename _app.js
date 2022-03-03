// Init environment variables
import dotenv from 'dotenv';
dotenv.config();
// Require the necessary discord.js classes
import { Client, Intents } from 'discord.js';
import { CreateEmbed } from './Utilities/EmbedGenerator.js';

import { ObtainSkinlist } from './Utilities/SkinsListFetch.js'
// Commands
import { daily } from './Commands/daily.js';
import { watch } from './Commands/watch.js';
import { waitlist } from './Commands/waitlist.js';
import { totalspent } from './Commands/totalspent.js';
// Logger
import { Logger } from './Utilities/Logger.js';
//Cron
import cron from 'node-cron';
import { DailyCheck } from './Cron/DailyCheck.js';

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
    Logger.info("Running task for store checking");
    cron.schedule("0 0 8 * * *", async () => {
        Logger.info("Running task for store checking");
        await DailyCheck(client,skinslist);
    }, { timezone: "Asia/Manila" });
    Logger.info('Commands are registered and is ready to go.');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand())
    {
         // Defer the reply until we're ready
        const { commandName } = interaction;
        const params = interaction.options;
        switch(commandName)
        {
            case "dailybeta":
                await interaction.deferReply();
                return await daily(interaction);

            case "watchbeta":
                await interaction.deferReply({fetchReply: true});
                return await watch(interaction, params, skinslist);

            case "waitlistbeta":
                await interaction.deferReply({fetchReply: true});
                return await waitlist(interaction, skinslist);

            case "totalspentbeta":
                await interaction.deferReply();
                return await totalspent(interaction);
        }
        return;
    }
});


// Login to Discord with your client's token
client.login(token);