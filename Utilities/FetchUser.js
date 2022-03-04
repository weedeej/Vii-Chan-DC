import dotenv from 'dotenv';
import { MessageActionRow, MessageButton } from 'discord.js';
import { CreateEmbed } from '../Utilities/EmbedGenerator.js';
import { Logger } from '../Utilities/Logger.js';
import axios from 'axios';
dotenv.config();

export default async function FetchUser(interaction, senderID) {
	Logger.info('Fetching user from API.', senderID);
	const Instance = axios.create({ baseURL: 'https://vtools-next.vercel.app/api' });
	const privacyKey = process.env.PRIVACY_KEY;
	const updater = process.env.AUTHORIZED_UPDATER.split('|');

	const resp = await Instance.get(`/store/${senderID}/check?updater_id=${updater[0]}&key=${privacyKey}`).catch(async err => {
		Logger.error(err, senderID);
		if (err.response.status == 404) {
			Logger.error('User has no session', senderID);
			const embed = CreateEmbed({ title:'Error ', description:'Your session can\'t be found in our list. Please consider adding your session by clicking the button below', color:'#eb4034', footer: { text: 'If other users click the link, You will be able to use their account session instead of yours.' } });
			embed['components'] = [
				new MessageActionRow().addComponents(
					new MessageButton()
						.setLabel('Add Session')
						.setURL(`https://vtools-next.vercel.app/auth?id=${senderID}`)
						.setStyle('LINK'),
				),
			];
			await interaction.editReply(embed);
			return 0;
		} else if (err.response.status == 400 || err.response.status == 401) {
			Logger.error('User has expired session', senderID);
			const embed = CreateEmbed({ title:'Error ', description:'Your session has expired because you changed password/riot\'s update revoked it. Please update your session by clicking the button below', color:'#eb4034', footer: { text: 'If other users click the link, You will be able to use their account session instead of yours.' } });
			embed['components'] = [
				new MessageActionRow().addComponents(
					new MessageButton()
						.setLabel('Add Session')
						.setURL(`https://vtools-next.vercel.app/auth?id=${senderID}`)
						.setStyle('LINK'),
				),
			];
			await interaction.editReply(embed);
			return 0;
		}
		await interaction.editReply(CreateEmbed({ title:'Error', description:'Something went wrong while fetching user. Please try again later.', color:'#eb4034' }));
		return 0;
	});
	return resp;
}

export async function NoInteractFetch(userId) {
	Logger.info('Fetching user from API.', `DAILY | ${userId}`);
	const Instance = axios.create({ baseURL: 'https://vtools-next.vercel.app/api' });
	const privacyKey = process.env.PRIVACY_KEY;
	const updater = process.env.AUTHORIZED_UPDATER.split('|');

	const resp = await Instance.get(`/store/${userId}/check?updater_id=${updater[0]}&key=${privacyKey}`).catch(async err => {
		try {
			Logger.error(JSON.stringify(err.response.data), `DAILY | ${userId}`);
			return err.response;
		} catch {
			Logger.severe(err, `DAILY | ${userId}`);
		}
		return 0;
	});
	return resp;
}