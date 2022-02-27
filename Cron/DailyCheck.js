import dotenv from 'dotenv';
import { NoInteractFetch } from "../Utilities/FetchUser.js";
import { CreateEmbed } from '../Utilities/EmbedGenerator.js';
import { MessageActionRow, MessageButton, MessageAttachment } from 'discord.js';
import { Logger } from '../Utilities/Logger.js';
import wait from '../Utilities/Wait.js';
import axios from 'axios';
dotenv.config();

export async function DailyCheck(client, skinslist) {
    const privacyKey = process.env.PRIVACY_KEY;
    const updater = process.env.AUTHORIZED_UPDATER.split('|');
    let resp = 0
    while( resp === 0 ) {
        resp = await axios.get(`https://vtools-next.vercel.app/api/store/users?updater_id=${updater[0]}&key=${privacyKey}`).catch( async err => {
            Logger.error("Error obtaining users list"+err, "DAILY");
            return 0;
        });
        await wait(5000);
    }
    //const testList = ["489421877853290500"];
    //testList.forEach(async userId => {
    resp.data.data.forEach(async userId => {
        Logger.info("Checking user...", `DAILY | ${userId}`);
        const user = await client.users.fetch(userId);
        const userData = await NoInteractFetch(userId);
        if (userData === 0) {
            Logger.info("An error has occured.", `DAILY | ${userId}`);
            return;
        }
        const available = userData.data.available;
        const wallet = userData.data.wallet;
        if (available === undefined) {
            Logger.info(`An error has occured: ${userData.data.error}`, `DAILY | ${userId}`);
            return;
        }
        if (available.length < 1)
        {
            Logger.info("User has no available skins for today.", `DAILY | ${userId}`);
            return;
        };
        Logger.info("Obtaining available skins info...", `DAILY | ${userId}`);
        available.forEach(async availableSkin => {
            Logger.info(`${availableSkin.displayName} is available for this user`, `DAILY | ${userId}`);
            const embed = CreateEmbed({
                title:"D A I L Y  C H E C K",
                description:"This skin is currently in your store! It is also removed from your watchlist so you can watch other skins",
                imageUrl: availableSkin.displayIcon,
                footer: {text:`${wallet.valorantPoints} VP | ${wallet.radianitePoints} RP`}
            });
            user.send(embed);
            Logger.info("Removing skin from watchlist...", `DAILY | ${userId}`);
            await axios.delete(`https://vtools-next.vercel.app/api/store/${userId}/remove/${availableSkin.uuid}?updater_id=${updater[0]}&key=${privacyKey}`)
            Logger.success(`${availableSkin.displayName} notification has been sent!`, `DAILY | ${userId}`);
            await wait(1000);
        });
    });
}