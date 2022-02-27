// Init environment variables
import { SlashCommandBuilder, SlashCommandStringOption, SlashCommandNumberOption } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import dotenv from 'dotenv';
dotenv.config();

const { clientId, guildId, token } = { 
    clientId: process.env.DISCORD_CLIENT_ID, 
    guildId: process.env.DISCORD_GUILD_ID,
    token: process.env.DISCORD_BOT_TOKEN 
};

const commands = [
	// Daily
	new SlashCommandBuilder().setName('dailybeta')
			.setDescription('Sends your daily offers in this channel.'),

	// Watch
	new SlashCommandBuilder().setName('watchbeta')
			.setDescription('Watch a skin and notifies you when it appears on your store.')
			.addStringOption(new SlashCommandStringOption().setName('skinname').setRequired(true).setDescription('The skin to watch.')),
	// wait List
	new SlashCommandBuilder().setName('waitlistbeta')
			.setDescription('Sends your waitlist in this channel.'),
	// Remove
	new SlashCommandBuilder().setName('unwatchbeta')
			.setDescription('Removes a skin from your wait list.')
			.addNumberOption(new SlashCommandNumberOption().setName('position').setRequired(true).setDescription('The Index Postion of the skin to remove.')),
	// Total Spent		
	new SlashCommandBuilder().setName('totalspentbeta')
			.setDescription('Responsd with the amount of how much you spent in VALORANT')

].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);