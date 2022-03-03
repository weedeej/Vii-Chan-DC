import dotenv from 'dotenv';
import { Logger } from '../Utilities/Logger.js';
import axios from 'axios';
import fs from 'fs';
import { MessageAttachment } from 'discord.js';
import { CreateEmbed } from '../Utilities/EmbedGenerator.js';
dotenv.config();

const Instance = axios.create({ baseURL: 'https://vtools-next.vercel.app/api'});
const privacyKey = process.env.PRIVACY_KEY;
const updater = process.env.AUTHORIZED_UPDATER.split('|')[0];

export async function totalspent(interaction)
{
    const senderID = interaction.user.id;

    Logger.info(`Sent a totalspent command >>`, senderID);
    const startMills = Date.now();

    Logger.info(`Obtaining payment history`, senderID);
    const response = await Instance.get(`/store/${senderID}/totalspent?updater_id=${updater}&key=${privacyKey}`).catch(async err => {
        Logger.error(err, senderID);
        
        const errorEmbed = CreateEmbed({title:"Error", description:err.response.data.error, color:'#eb4034'});
        return await interaction.editReply(errorEmbed);
    });
    Logger.info(`Payment history obtained.`, senderID);
    
    const total = response.data.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const currency = response.data.currency;
    Logger.info(`Creating embed`, senderID);
    const embed = CreateEmbed({ title: "T O T A L  S P E N T", description: `You have spent a total of **${total}${currency}**. Riot is truly grateful for your support.`});
    return await interaction.editReply(embed).then(()=>{
        Logger.success("<< Totalspent command finished", senderID);
    });
}