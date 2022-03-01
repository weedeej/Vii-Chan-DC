import dotenv from 'dotenv';
import { joinImages } from 'join-images';
import { CreateEmbed } from '../Utilities/EmbedGenerator.js';
import { MessageActionRow, MessageButton, MessageAttachment } from 'discord.js';
import { Logger } from '../Utilities/Logger.js';
import FetchUser from '../Utilities/FetchUser.js';
import fs from 'fs';
import axios from 'axios';

dotenv.config();

const Instance = axios.create({ baseURL: 'https://vtools-next.vercel.app/api'});
const privacyKey = process.env.PRIVACY_KEY;
const updater = process.env.AUTHORIZED_UPDATER.split('|');

export async function waitlist(interaction, skinlist) {
    const senderID = interaction.user.id;
    Logger.info(`Sent a waitlist command >>`, senderID);
    let startMills = Date.now();
    
    const resp = await FetchUser(interaction, senderID);
    if (resp == 0) return;

    const waitlist = resp.data.waitList;
    if (waitlist.length < 1)
    {
        Logger.info("User have nothing in their waitlist.", senderID);
        Logger.info("Creating exiting embed.", senderID);
        const errorEmbed = CreateEmbed({title:"W A I T L I S T", description:"You have nothing in your waitlist"});
        errorEmbed["components"] = [];
        errorEmbed["files"] = [];
        const endMills = Date.now();
        const millsDone = endMills - startMills;
        const secDone = millsDone / 1000;
        await interaction.editReply(errorEmbed);
        return Logger.success(`Waitlist action is done: ${secDone}s (${millsDone}ms)`, senderID);
    }
    let components = [new MessageActionRow()]; // Initial Row
    let fields = [];
    let buttonCount = 0;
    let rowPos = 0;
    let images = [];
    Logger.info(`Creating Components and Fields`, senderID);
    for (let i = 0; i < waitlist.length; i++) {
        if (buttonCount == 5) {
            components.push(new MessageActionRow());
            rowPos++;
            buttonCount = 0;
        }
        const currentRow = components[rowPos];
        const currentSkin = skinlist.data[waitlist[i]]
        currentRow.addComponents(
            new MessageButton()
                .setLabel(`[ ${i+1} ]`)
                .setCustomId(`remove_${waitlist[i]}_${senderID}`)
                .setStyle('DANGER')
        )
        fields.push({name: currentSkin.displayName, value: currentSkin.cost.toString(), inline: true});
        images.push(await axios.get(currentSkin.displayIcon, {responseType: 'arraybuffer'}).then(res => res.data));

        Logger.info(`Button num: ${i}: remove_${waitlist[i]}_${senderID}`, senderID);
        buttonCount++;
    }

    let imagePath = `./temp/${senderID}.png`
    await joinImages(images, {direction: 'horizontal', color: { alpha: 0.0, b: 0, g: 0, r: 0 }}).then(async (img) => {
        Logger.info('Creating temporary compilation of skin images.', senderID);
        await img.toFile(imagePath);
    }); 
    Logger.info('Adding attachment.', senderID);
    const attachment = new MessageAttachment(imagePath);

    Logger.info('Creating embed.', senderID); 
    let embed = CreateEmbed({
        title:"W A I T L I S T",
        description:"These are your awaited skins. Click the button below to remove one of them.", 
        fields,
        imageUrl:`attachment://${senderID}.png`,
    });
    embed["files"] = [attachment];
    embed["components"] = components;
    Logger.info('Sending reply.', senderID);
    await interaction.editReply(embed)
        .then(() => {
            const endMills = Date.now();
            const millsDone = endMills - startMills;
            const secDone = millsDone / 1000;
            Logger.success(`<< Waitlist command is done: ${secDone}s (${millsDone}ms)`, senderID);
        });

    Logger.info('Adding Collector.', senderID);
    const filter = (buttonInteraction) => {
        return senderID === buttonInteraction.user.id;
    }

    const buttonPressListener = interaction.channel.createMessageComponentCollector({ filter, max:1, time: 60000, componentType: 'BUTTON' });
    buttonPressListener.on('collect', async i => {
        Logger.info(`Button pressed: ${i.customId}`, senderID);
        startMills = Date.now();
        const buttonId = i.customId.split("_");
        switch (buttonId[0]) {
            case "remove":
                await remove_button_action(i, buttonId[1], skinlist);
                try
                {
                    if (fs.existsSync(imagePath)) {
                        fs.unlink(imagePath, () => {});
                    }
                }catch(e) {}
                const endMills = Date.now();
                const millsDone = endMills - startMills;
                const secDone = millsDone / 1000;
                return Logger.success(`<< Remove button action is done: ${secDone}s (${millsDone}ms)`, senderID);
        }
    });

    buttonPressListener.on('end', async (i) => {
        if (i.first() === undefined){
            embed["embeds"][0].description += "\n**This interaction is no longer available**";
            embed["components"] = [];
            return await interaction.editReply(embed);
        }
    })
}

export async function remove_button_action(interaction, skinId, skinlist) {
    const senderID = interaction.user.id;
    Logger.info(`Received a remove button action >>`, senderID);
    const startMills = Date.now();

    const resp = await Instance.delete(`/store/${senderID}/remove/${skinId}?updater_id=${updater[0]}&key=${privacyKey}`).catch(async err => {
        Logger.error(err, senderID);
        const errorEmbed = CreateEmbed({title:"Error", description:err.response.data.error, color:'#eb4034'});
        errorEmbed["components"] = [];
        errorEmbed["files"] = [];
        return await interaction.update(errorEmbed);
    });
    if (resp === undefined) return;
    Logger.info(`Remove from waitlist. Reflecting Response.`, senderID);
    const waitlist = resp.data.data;
    if (waitlist.length < 1)
    {
        Logger.info("User have nothing in their waitlist.", senderID);
        Logger.info("Creating exiting embed.", senderID);

        const errorEmbed = CreateEmbed({title:"W A I T L I S T", description:"You have nothing in your waitlist"});
        errorEmbed["components"] = [];
        errorEmbed["files"] = [];
        const endMills = Date.now();
        const millsDone = endMills - startMills;
        const secDone = millsDone / 1000;
        await interaction.update(errorEmbed);
        return Logger.success(`Waitlist action is done: ${secDone}s (${millsDone}ms)`, senderID);
    }
    let components = [new MessageActionRow()]; // Initial Row
    let fields = [];
    let buttonCount = 0;
    let rowPos = 0;
    let images = [];
    Logger.info(`Creating Components and Fields`, senderID);
    for (let i = 0; i < waitlist.length; i++) {
        if (buttonCount == 5) {
            components.push(new MessageActionRow());
            rowPos++;
            buttonCount = 0;
        }
        const currentRow = components[rowPos];
        const currentSkin = skinlist.data[waitlist[i]]
        currentRow.addComponents(
            new MessageButton()
                .setLabel(`[ ${i+1} ]`)
                .setCustomId(`remove_${waitlist[i]}_${senderID}`)
                .setStyle('DANGER')
        )
        fields.push({name: currentSkin.displayName, value: currentSkin.cost.toString(), inline: true});
        images.push(await axios.get(currentSkin.displayIcon, {responseType: 'arraybuffer'}).then(res => res.data));

        Logger.info(`Button num: ${i}: remove_${waitlist[i]}_${senderID}`, senderID);
        buttonCount++;
    }

    let imagePath = `./temp/${senderID}.png`
    await joinImages(images, {direction: 'horizontal', color: { alpha: 0.0, b: 0, g: 0, r: 0 }}).then(async (img) => {
        Logger.info('Creating temporary compilation of skin images.', senderID);
        await img.toFile(imagePath);
    }); 
    Logger.info('Adding attachment.', senderID);
    const attachment = new MessageAttachment(imagePath);

    Logger.info('Creating embed.', senderID); 
    let embed = CreateEmbed({
        title:"W A I T L I S T",
        description:"These are your awaited skins. Click the button below to remove one of them.", 
        fields,
        imageUrl:`attachment://${senderID}.png`,
    });
    embed["files"] = [attachment];
    embed["components"] = components;
    Logger.info('Sending reply.', senderID);
    await interaction.update(embed)
        .then(() => {
            const endMills = Date.now();
            const millsDone = endMills - startMills;
            const secDone = millsDone / 1000;
            Logger.success(`<< Waitlist command is done: ${secDone}s (${millsDone}ms)`, senderID);
        });

    Logger.info('Adding Collector.', senderID);
    const filter = (buttonInteraction) => {
        return senderID === buttonInteraction.user.id;
    }

    const buttonPressListener = interaction.channel.createMessageComponentCollector({ filter, max:1, time: 60000, componentType: 'BUTTON' });
    buttonPressListener.on('collect', async i => {
        Logger.info(`Button pressed: ${i.customId}`, senderID);
        const buttonId = i.customId.split("_");
        switch (buttonId[0]) {
            case "remove":
                await remove_button_action(i, buttonId[1], skinlist);
                try
                {
                    if (fs.existsSync(imagePath)) {
                        fs.unlink(imagePath, () => {});
                    }
                }catch(e) {}
                const endMills = Date.now();
                const millsDone = endMills - startMills;
                const secDone = millsDone / 1000;
                return Logger.success(`<< Remove button action is done: ${secDone}s (${millsDone}ms)`, senderID);
        }
    });

    Logger.info(`Updating reply.`, senderID);
    buttonPressListener.on('end', async (i) => {
        if (i.first() === undefined){
            embed["embeds"][0].description += "\n**This interaction is no longer available**";
            embed["components"] = [];
            return await interaction.editReply(embed);
        }
    });
}