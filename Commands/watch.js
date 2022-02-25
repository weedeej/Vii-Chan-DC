import dotenv from 'dotenv';
import { joinImages } from 'join-images';
import { CreateEmbed } from '../Utilities/EmbedGenerator.js';
import { MessageActionRow, MessageButton } from 'discord.js';
import { Logger } from '../Utilities/Logger.js';
import similarity from 'string-cosine-similarity/index.js';
import fs from 'fs';
import axios from 'axios';

dotenv.config();

const Instance = axios.create({ baseURL: 'https://vtools-next.vercel.app/api'});
const privacyKey = process.env.PRIVACY_KEY;
const updater = process.env.AUTHORIZED_UPDATER.split('|');

export async function watch(interaction, params, skinlist) {
    const senderID = interaction.user.id;

    Logger.info(`Sent a watch command >>`, senderID);
    const startMills = Date.now();

    const query = params.get("skinname").value;
    Logger.info(`Passed Query: ${query}`, senderID);
    
    let similarities = [];
    const keys = Object.keys(skinlist.data)
    Logger.info("Comparing similarties against dataset", senderID);
    for(let i = 0; i < keys.length; i++) {
        const skin = skinlist.data[keys[i]];
        const percentage = similarity(query, skin.displayName);
        if (isNaN(percentage)) continue;
        similarities.push({uuid: keys[i], value:percentage});
    }

    similarities = similarities.sort((a, b) => b.value - a.value);
    Logger.info(`Comparison found ${similarities.length} similarities`, senderID);
    if (similarities.length == 0) {
        return await interaction.editReply(CreateEmbed({title:"Error", description:"No skins found.", color:'#eb4034'}));
    }else if (similarities.length > 25) {
        for (let i = similarities.length; i > 25; i--) {
            similarities.pop(); 
        }
    }
    let components = [new MessageActionRow()]; // Initial Row
    let fields = [];
    let buttonCount = 0;
    let rowPos = 0;
    Logger.info(`Creating Components and Fields`, senderID);
    for (let i = 0; i < similarities.length; i++) {
        if (buttonCount == 5) {
            components.push(new MessageActionRow());
            rowPos++;
            buttonCount = 0;
        }
        const currentRow = components[rowPos];
        const currentSkin = skinlist.data[similarities[i].uuid]
        currentRow.addComponents(
            new MessageButton()
                .setLabel(`[ ${i+1} ]`)
                .setCustomId("watch_"+similarities[i].uuid+"_"+senderID)
                .setStyle('PRIMARY')
        )

        fields.push({name: currentSkin.displayName, value: currentSkin.cost.toString(), inline: true});
        buttonCount++;
    }
    Logger.info('Creating embed.', senderID); 
    const embed = CreateEmbed({
        title:"W A T C H",
        description:"Use the button below to select what you want to watch.",
        fields
    });

    embed["components"] = components;
    Logger.info('Sending reply.', senderID);
    await interaction.editReply(embed)
        .then(() => {
            const endMills = Date.now();
            const millsDone = endMills - startMills;
            const secDone = millsDone / 1000;
            Logger.success(`<< Watch command is done: ${secDone}s (${millsDone}ms)`, senderID);
        });

    startMills = Date.now();
    Logger.info('Adding Collector.', senderID);
    const filter = (buttonInteraction) => {
        return senderID === buttonInteraction.user.id;
    }

    const buttonPressListener = interaction.channel.createMessageComponentCollector({filter, max:1, time: 10000 });
    buttonPressListener.on('collect', async i => {
        Logger.info(`Button pressed: ${i.customId} by ${i.user.id}`);
    });

    buttonPressListener.on('end', async (col) =>{
        const buttonId = col.first()?.customId.split("_");
        switch (buttonId[0]) {
            case "watch":
                return await watch_button_action(col.first(), buttonId[1]);
        }
    });
}

export async function watch_button_action(interaction, skinId) {
    const senderID = interaction.user.id;
    Logger.info(`Received a watch button action >>`, senderID);
    const startMills = Date.now();

    const resp = await Instance.get(`/store/${senderID}/add/${skinId}?updater_id=${updater[0]}&key=${privacyKey}`).catch(async err => {
        Logger.error(err, senderID);
        return await interaction.editReply(CreateEmbed({title:"Error", description:"Something went wrong while adding. Please try again later.", color:'#eb4034'}));
    });
    if(resp.status != 200) { 
        Logger.error(`Error adding skin to waitlist: ${resp.status}`, senderID);
        return await interaction.editReply(CreateEmbed({title:"Error", description:"Something went wrong while adding. Please try again later.", color:'#eb4034'}));
    }
    Logger.info(`Added to waitlist. Reflecting Response.`, senderID);
    const skinData = resp.data.data;
    Logger.info(`Creating Embed`, senderID);
    const embed = CreateEmbed({
        title: "W A T C H",
        description: `${skinData.displayName} has been added to your waitlist.`,
        imageUrl: skinData.displayIcon
    });
    embed["components"] = [];
    Logger.info(`Updating reply.`, senderID);
    return await interaction.update(embed).then(() => {
        const endMills = Date.now();
        const millsDone = endMills - startMills;
        const secDone = millsDone / 1000;
        Logger.success(`<< Watch button action is done: ${secDone}s (${millsDone}ms)`, senderID);
    });
}