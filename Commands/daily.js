import dotenv from 'dotenv';
import { joinImages } from 'join-images';
import { CreateEmbed } from '../Utilities/EmbedGenerator.js';
import { MessageActionRow, MessageAttachment, MessageButton } from 'discord.js';
import { Logger } from '../Utilities/Logger.js';
import FetchUser from '../Utilities/FetchUser.js';
import fs from 'fs';
import axios from 'axios';

dotenv.config();

const Instance = axios.create({ baseURL: 'https://vtools-next.vercel.app/api'});
const privacyKey = process.env.PRIVACY_KEY;
const updater = process.env.AUTHORIZED_UPDATER.split('|');

export async function daily(interaction) {
    const senderID = interaction.user.id;

    Logger.info(`Sent a daily command >>`, senderID);
    const startMills = Date.now();

    const resp = await FetchUser(interaction, senderID);
    if (resp == 0) return;
    const offers = resp.data.offersData;
    const {valorantPoints, radianitePoints} = resp.data.wallet;

    let fields = [];
    let images = [];
    Logger.info(`${senderID} has ${offers.length} offers. Pushing Images and creating fields.`, senderID);
    for (let i = 0; i < offers.length; i++) {
        const offer = offers[i];
        fields.push({name:offer.displayName, value:String(offer.cost)+" VP", inline:true});
        images.push(await axios.get(offer.displayIcon, {responseType: 'arraybuffer'}).then(res => res.data));
    }
    let imagePath = `./temp/${senderID}.png`
    await joinImages(images, {direction: 'horizontal', color: { alpha: 0.0, b: 0, g: 0, r: 0 }}).then(async (img) => {
        Logger.info('Creating temporary compilation of skin images.', senderID);
        await img.toFile(imagePath);
    }); 
    Logger.info('Adding attachment.', senderID);
    const attachment = new MessageAttachment(imagePath);
    
    Logger.info('Creating embed.', senderID); 
    const embed = CreateEmbed({
        title:"D A I L Y   O F F E R S",
        description:"These skins are currently being offered.",
        fields,
        imageUrl:`attachment://${senderID}.png`,
        footer: {text:`${valorantPoints} VP | ${radianitePoints} RP`}
    });
    embed["files"] = [attachment];
    Logger.info('Sending reply.', senderID);
    return await interaction.editReply(embed)
        .then(() => {
            fs.unlink(imagePath, () => {});
            const endMills = Date.now();
            const millsDone = endMills - startMills;
            const secDone = millsDone / 1000;
            Logger.info('Temporary image has been deleted.', senderID);
            Logger.success(`<< Daily command is done: ${secDone}s (${millsDone}ms)`, senderID);
        });
}